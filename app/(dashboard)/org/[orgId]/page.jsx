import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/button";
import PBUser from "@/lib/pb/user";
import Header from "./components/header";
import Dashboard from "./components/org-dashboard";
import {
  CREATE_PROJECTS,
  MANAGE_PROJECTS,
  MANAGE_ROLES,
  MANAGE_EXTENSIONS,
  VIEW_EXTENSIONS,
} from "@/../templates/permissions";
import { ORG_SETTINGS } from "@/constants/page-routes";

export default async function OrgPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);

  const [
    createProjects,
    manageProjects,
    canEditOrg,
    canManageRoles,
    canManageExtensions,
    canUseExtensions,
  ] = await Promise.all([
    pbOrg.iHavePermission(CREATE_PROJECTS),
    pbOrg.iHavePermission(MANAGE_PROJECTS),
    pbOrg.iHavePermission(""), // Admin-only
    pbOrg.iHavePermission(MANAGE_ROLES),
    pbOrg.iHavePermission(MANAGE_EXTENSIONS),
    pbOrg.iHavePermission(VIEW_EXTENSIONS),
  ]);

  const canCreateProject = createProjects || manageProjects;
  const showSettings = canEditOrg || canManageRoles || canManageExtensions;
  const settingsButton = showSettings ? (
    <Link href={ORG_SETTINGS(orgId)}>
      <Button variant="outline" asChild>
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </Link>
  ) : null;

  const prjInvites = (await pbOrg.getMyProjectInvites()).map((invite) => ({
    id: invite.id,
    title: invite.expand.project.name,
    description: invite.expand.project.description,
    roles: invite.expand.roles?.map((role) => ({
      id: role.id,
      name: role.name,
      color: role.color,
    })),
  }));

  const extReqsComponents = await pbOrg.getAllExtensionRequestComponents();
  const extensionsObj = await pbOrg.getAllAddedExtensions();
  let extensions = await Promise.all(
    extensionsObj.map(async (extension) => ({
      id: extension.id,
      name: extension.name,
      description: await extension.getDesc(),
      showSettings: !!extension.getSettings,
    })),
  );

  return (
    <div className="flex flex-col">
      <Header orgId={orgId} settingsButton={settingsButton} />
      <main className="flex-grow">
        <Dashboard
          orgId={orgId}
          prjInvites={prjInvites}
          extensions={extensions}
          extReqsComponents={extReqsComponents}
          canCreateProject={canCreateProject}
        />
      </main>
    </div>
  );
}
