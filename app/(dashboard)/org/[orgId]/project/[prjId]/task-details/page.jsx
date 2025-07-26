import PBUser from "@/lib/pb/user";
import { PRJ_DASHBOARD, PRJ_TASK_DETAILS } from "@/constants/page-routes";
import Link from "next/link";
import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";
import { EditableTaskList } from "../components/task-list";

import { extractTasksWithHistory } from "../utils.js";

export default async function TaskDetailsPage({ params }) {
  const { prjId, orgId } = await params;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const pbPrj = await pbOrg.getProject(prjId);

  const [statusesRaw, membersRaw, allTasksObj] = await Promise.all([
    pbPrj.getAllStatuses(),
    pbPrj.getAllMembers(),
    pbPrj.getAllTasks(),
  ]);
  const allTasksWithHistory = await extractTasksWithHistory(allTasksObj);
  console.log(allTasksWithHistory);

  const members = membersRaw.map((member) => ({
    id: member.id,
    name: member.expand.org_member.expand.user.name,
  }));
  const statuses = statusesRaw.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href={PRJ_DASHBOARD(orgId, prjId)}>
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <h2 className="text-2xl font-bold">Project Tasks Details</h2>
      </div>
      <EditableTaskList
        tasks={allTasksWithHistory}
        members={members}
        statuses={statuses}
      />
    </div>
  );
}
