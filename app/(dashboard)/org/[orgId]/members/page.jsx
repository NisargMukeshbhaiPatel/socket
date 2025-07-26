import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import InvitesManagement from "./components/invites-management";
import MembersManagement from "./components/members-management";
import InviteForm from "./components/invite-form";
import { ADD_MEMBERS, MANAGE_MEMBERS } from "@/../templates/permissions";

import { ORG_SETTINGS, ORG_DASHBOARD } from "@/constants/page-routes";

import PBUser from "@/lib/pb/user";

export default async function MembersManagementPage({ params }) {
  const orgId = (await params).orgId;
  const headersList = await headers();
  const previousPath = headersList.get("referer");

  const pbUser = await PBUser.get();
  const org = await pbUser.getOrg(orgId);
  const [canAddMembers, canManageMembers] = await Promise.all([
    org.iHavePermission(ADD_MEMBERS),
    org.iHavePermission(MANAGE_MEMBERS),
  ]);

  let allInvites;
  if (canAddMembers) {
    allInvites = await org.getAllInvites();
  }

  let members;
  if (canManageMembers) {
    members = (await org.getAllMembers()).map((member) => ({
      id: member.id,
      name: member.expand.user.name,
      email: member.expand.user.email,
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
            previousPath?.includes("/create")
              ? ORG_DASHBOARD(orgId)
              : ORG_SETTINGS(orgId)
          }
        >
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <h2 className="text-2xl font-bold">Members Management</h2>
      </div>
      {canAddMembers && (
        <>
          <InviteForm orgId={orgId} />
          <InvitesManagement
            invitesList={allInvites.map((invite) => ({
              id: invite.id,
              status: invite.status,
              updated: invite.updated,
              email: invite.email,
              roles: invite.expand?.roles,
            }))}
          />
        </>
      )}
      {canManageMembers && (
        <MembersManagement orgMembers={members} orgId={orgId} />
      )}
    </div>
  );
}
