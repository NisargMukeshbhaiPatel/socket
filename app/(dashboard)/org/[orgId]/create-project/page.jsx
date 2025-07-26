import { orgTemplates, projectTemplates } from "@/lib/getTemplates";
import { redirect } from "next/navigation";
import { ORG_DASHBOARD } from "@/constants/page-routes";
import { CREATE_PROJECTS, MANAGE_PROJECTS } from "@/../templates/permissions";
import { getAllPrjExtensions } from "@/lib/exts.js";
import ProjectCreationForm from "./ProjectCreationForm";
import PBUser from "@/lib/pb/user";

export default async function CreateProjectPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const [createProjects, manageProjects] = await Promise.all([
    pbOrg.iHavePermission(CREATE_PROJECTS),
    pbOrg.iHavePermission(MANAGE_PROJECTS),
  ]);
  const canCreateProject = createProjects || manageProjects;
  if (!canCreateProject) {
    redirect(ORG_DASHBOARD(orgId));
  }

  const orgTemplate = await pbOrg.getOrgTemplate();
  const availableExtensions = await getAllPrjExtensions(pbUser.pb);
  const prjTempIds = orgTemplate?.projectTemplates || [];

  return (
    <ProjectCreationForm
      orgId={orgId}
      availableExtensions={availableExtensions}
      projectTemplates={projectTemplates.filter((pt) =>
        prjTempIds.includes(pt.id),
      )}
    />
  );
}
