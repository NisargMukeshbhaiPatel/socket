import PBUser from "@/lib/pb/user";
// import { getServerTranslation } from "@/../i18n/server";
import {
  PRJ_SETTINGS,
  PRJ_CREATE_TASK,
  PRJ_TASK_DETAILS,
  PRJ_EXTENSION,
  PRJ_EXTENSION_SETTINGS,
  ORG_DASHBOARD,
} from "@/constants/page-routes";
import Link from "next/link";
import { Settings, Plus, ArrowLeft, Sparkles, SquarePlay } from "lucide-react";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import CreateTaskButton from "./components/create-task-button";
import { EditableTaskList } from "./components/task-list";
import AITaskGenerator from "./components/ai-task-generator";

import { extractTasksData } from "./utils.js";

export default async function PrjPage({ params }) {
  const { prjId, orgId } = await params;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const pbPrj = await pbOrg.getProject(prjId);

  //TODO exts Components
  const [
    extReqsComponentsRaw,
    statusesRaw,
    membersRaw,
    allTasksObj,
    myTasksObj,
    extensionsObj,
  ] = await Promise.all([
    pbPrj.getAllExtensionRequestComponents(),
    pbPrj.getAllStatuses(),
    pbPrj.getAllMembers(),
    pbPrj.getAllTasks(),
    pbPrj.getMyTasks(),
    pbPrj.getAllAddedExtensions(),
  ]);
  const extReqsComponents = extReqsComponentsRaw;

  let extensions = await Promise.all(
    extensionsObj.map(async (extension) => ({
      id: extension.id,
      name: extension.name,
      description: await extension.getDesc(),
      showSettings: !!extension.getSettings,
    })),
  );

  const allTasks = await extractTasksData(allTasksObj);
  const myTasks = await extractTasksData(myTasksObj);

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
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Link href={ORG_DASHBOARD(orgId)}>
            <ArrowLeft className="h-8 w-8" />
          </Link>
          <h1 className="text-2xl font-bold">{pbPrj.project.name}</h1>
        </div>
        <div className="flex gap-2">
          <CreateTaskButton statuses={statuses} members={members} />
          <Link href={PRJ_TASK_DETAILS(orgId, prjId)}>
            <Button variant="outline">Task Details</Button>
          </Link>
          <Link href={PRJ_SETTINGS(orgId, prjId)}>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      {/* 
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Project Requests</h2>
        <Card className="flex flex-col items-center justify-center">
          <CardHeader>
            <CardDescription className="text-center">
              No Requests found
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
	  */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
        <EditableTaskList
          tasks={myTasks}
          members={members}
          statuses={statuses}
        />
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">All Project Tasks</h2>
        <EditableTaskList
          tasks={allTasks}
          members={members}
          statuses={statuses}
        />
      </section>
      <section className="mt-8">
        <div className="flex">
          <Sparkles className="w-7 h-7 text-blue-500" />
          <h2 className="text-2xl font-bold mb-4">AI Actions</h2>
        </div>
        <AITaskGenerator members={members} statuses={statuses} />
      </section>
      {extensions.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Project Extensions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {extensions.map((extension) => (
              <Card
                key={extension.id}
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <CardTitle>{extension.name}</CardTitle>
                  <CardDescription>{extension.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center">
                  <Link href={PRJ_EXTENSION(orgId, prjId, extension.id)}>
                    <Button asChild variant="outline">
                      Run
                      <SquarePlay />
                    </Button>
                  </Link>
                  {extension.showSettings && (
                    <Link
                      href={PRJ_EXTENSION_SETTINGS(orgId, prjId, extension.id)}
                    >
                      <Button asChild className="ml-2" variant="outline">
                        <Settings />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
