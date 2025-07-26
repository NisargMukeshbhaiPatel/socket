import Link from "next/link";
import { EXTENSION } from "@/constants/page-routes";
import { ArrowLeft } from "lucide-react";
import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";

import AssignmentHistoryExport from "./components/export-history";
import AssignmentHistoryTable from "../components/AssignmentHistoryTable";
import { Button } from "@/components/button";

export default async function AssignmentHistoryPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const autoAlloc = await AutoAllocation.get(pbOrg);
  const assignmentHistoryData = await autoAlloc.getAssignHistory();
  const allSkills = (await autoAlloc.getAllSkills()) || [];
  
  const assignmentHistory = assignmentHistoryData.map(
    ({ id, matched, expand: { org_member, project, invite } }) => ({
      id,
      memberName: org_member.expand.user.name,
      matchedSkills: matched?.map((skillId) =>
        allSkills.find((s) => s.id === skillId),
      ),
      projectName: project.name,
      inviteStatus: invite ? invite.status : null,
    }),
  );

  return (
    <div className="container mx-auto px-6">
      <div className="flex gap-2 mr-auto mb-4">
        <Link href={EXTENSION(orgId, "AUTO_ALLOCATION")}>
          <ArrowLeft className="h-8 w-8 -ml-10 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Project Assignments</h1>
        <div className="ml-auto">
          <AssignmentHistoryExport assignmentHistory={assignmentHistory} />
        </div>
      </div>
      <AssignmentHistoryTable assignmentHistory={assignmentHistory} />
    </div>
  );
}
