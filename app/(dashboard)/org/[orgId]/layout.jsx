import { redirect } from "next/navigation";
import PBUser from "@/lib/pb/user";
import OrgDataProvider from "./context";

import UpdatePrjSidebar from "./components/update-prj-sidebar";

export default async function OrgPageLayout({ params, children }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const orgs = await pbUser.getCurrentOrgs();
  if (!orgs.some((org) => org.id === orgId)) {
    redirect("/");
  }

  const pbOrg = await pbUser.getOrg(orgId);
  // fetched here so it available for any route for sidebar
  const projects = (await pbOrg.getMyProjects()).map(({ project }) => ({
    ...project,
  }));

  return (
    <>
      <UpdatePrjSidebar projects={projects} />
      <OrgDataProvider currentOrgId={orgId} projects={projects}>
        {children}
      </OrgDataProvider>
    </>
  );
}
