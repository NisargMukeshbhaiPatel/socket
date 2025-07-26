import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import {
  getOrgImportHistory,
  getProjectImportHistory,
} from "@/lib/pb/importer";

import ImportHistory from "./components/import-history";
import ImportMembersCard from "./components/import-members-card";
import ImportProjectsCard from "./components/import-projects-card";
import { ORG_SETTINGS } from "@/constants/page-routes";

import PBOrg from "@/lib/pb/org";
import PBUser from "@/lib/pb/user";

export default async function MembersManagementPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const org = await pbUser.getOrg(orgId);
  const isAdmin = await org.iHavePermission("");
  if (!isAdmin) redirect(ORG_SETTINGS(orgId));

  const [membersHistory, projectHistory] = await Promise.all([
    getOrgImportHistory(org),
    getProjectImportHistory(org),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link href={ORG_SETTINGS(orgId)}>
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <h2 className="text-2xl font-bold">Import Data</h2>
      </div>
      <div className="flex gap-4 flex-wrap">
        <ImportMembersCard orgId={orgId} />
        <ImportProjectsCard orgId={orgId} />
      </div>
      <ImportHistory title="Members Import History" history={membersHistory} />
      <ImportHistory title="Project Import History" history={projectHistory} />
    </div>
  );
}
