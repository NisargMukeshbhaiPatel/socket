import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import InvitesManagement from "./components/invites-management";
import MembersManagement from "./components/members-management";
import InviteForm from "./components/invite-form";
import {
  ADD_MEMBERS,
  ADD_PRJ_MEMBERS,
  MANAGE_MEMBERS,
  MANAGE_PRJ_MEMBERS,
} from "@/../templates/permissions";

import { PRJ_SETTINGS, PRJ_DASHBOARD } from "@/constants/page-routes";

import PBUser from "@/lib/pb/user";

export default async function MembersManagementPage({ params }) {
  const { orgId, prjId } = await params;
  const headersList = await headers();
  const previousPath = headersList.get("referer");

  const pbUser = await PBUser.get();
  const org = await pbUser.getOrg(orgId);
  const pbPrj = await org.getProject(prjId);

  const [addMembers, manageMembers] = await Promise.all([
    pbPrj.iHavePermission(ADD_PRJ_MEMBERS),
    pbPrj.iHavePermission(MANAGE_PRJ_MEMBERS)
  ]);

  const [orgAddMembers, orgManageMembers] = await Promise.all([
    org.iHavePermission(ADD_MEMBERS),
    org.iHavePermission(MANAGE_MEMBERS),
  ]);

  const canAddMembers = (addMembers || manageMembers) && (orgAddMembers || orgManageMembers)

  let allInvites = [],
    orgMembers = [],
    prjRoles = [];
  if (canAddMembers) {
    allInvites = (await pbPrj.getAllInvites()).map((invite) => ({
      id: invite.id,
      status: invite.status,
      updated: invite.updated,
      name: invite.expand.org_member.expand.user.name,
      roles: invite.expand?.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        is_admin: role.is_admin,
      })),
    }));

    orgMembers = (await org.getAllMembers()).map((member) => ({
      id: member.id,
      name: member.expand.user.name,
      email: member.expand.user.email,
      roles: member.expand.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
      })),
    }));
    prjRoles = await pbPrj.getAllRoles();
  }

  let prjMembers = [];
  if (manageMembers) {
    prjMembers = (await pbPrj.getAllMembers()).map((member) => ({
      id: member.id,
      name: member.expand.org_member.expand.user.name,
      email: member.expand.org_member.expand.user.email,
      roles: member.expand.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
      })),
    }));
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link
          href={
            previousPath?.includes("/create-project")
              ? PRJ_DASHBOARD(orgId, prjId)
              : PRJ_SETTINGS(orgId, prjId)
          }
        >
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <h2 className="text-2xl font-bold">Members Management</h2>
      </div>
      {canAddMembers && (
        <>
          <InviteForm
            orgId={orgId}
            prjId={prjId}
            orgMembers={orgMembers}
            name={pbPrj.project.name}
            prjRoles={prjRoles}
          />
          <InvitesManagement invitesList={allInvites} />
        </>
      )}
      {manageMembers && (
        <MembersManagement
          prjMembers={prjMembers}
          orgId={orgId}
          prjId={prjId}
          prjRoles={prjRoles}
        />
      )}
    </div>
  );
}
