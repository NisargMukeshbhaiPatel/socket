import PBUser from "@/lib/pb/user";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { ArrowLeft } from "lucide-react";
import { PRJ_DASHBOARD } from "@/constants/page-routes";
import { Button } from "@/components/button";

import KanbanBoard from "./components/kanban-board";
import CreateTaskButton from "../../components/create-task-button";

import { extractTasksData } from "../../utils.js";

export default async function MyTasksPage({ params }) {
  const { prjId, orgId } = await params;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const pbPrj = await pbOrg.getProject(prjId);

  const [statusesRaw, membersRaw, myTasksObj, allTasksObj] = await Promise.all([
    pbPrj.getAllStatuses(),
    pbPrj.getAllMembers(),
    pbPrj.getMyTasks(),
    pbPrj.getAllTasks(),
  ]);

  const myTasks = await extractTasksData(myTasksObj);
  const allTasks = await extractTasksData(allTasksObj);

  const members = membersRaw.map((member) => ({
    id: member.id,
    name: member.expand.org_member.expand.user.name,
  }));

  const statuses = statusesRaw
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }))
    .sort((a, b) => b.name.localeCompare(a.name));

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex gap-2 mr-auto">
          <Link href={PRJ_DASHBOARD(orgId, prjId)}>
            <ArrowLeft className="h-8 w-8 cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold">
            Task Board - {pbPrj.project.name}
          </h1>
        </div>
        <CreateTaskButton statuses={statuses} members={members} />
      </div>
      {allTasks.length !== 0 || myTasks.length !== 0 ? (
        <KanbanBoard
          myTasks={myTasks}
          allTasks={allTasks}
          initialMembers={members}
          initialStatuses={statuses}
        />
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              There are currently no tasks to display. Create a new task to get
              started.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
