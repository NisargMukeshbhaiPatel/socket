import Link from "next/link";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { Plus, SquarePlay, Settings } from "lucide-react";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  PRJ_DASHBOARD,
  CREATE_PRJ,
  EXTENSION,
  EXTENSION_SETTINGS,
} from "@/constants/page-routes";
import PrjInvites from "./prj-invites.jsx";
import ProjectsGrid from "./projects-grid";

export default function OrgDashboard({
  orgId,
  extensions,
  canCreateProject,
  extReqsComponents,
  prjInvites,
}) {
  const tDB = useDBTranslation();
  console.log(extReqsComponents);
  return (
    <div className="container py-8">
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          {canCreateProject && (
            <Link href={CREATE_PRJ(orgId)}>
              <Button asChild>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>
        <ProjectsGrid />
      </section>

      {(extReqsComponents.length > 0 || prjInvites?.length > 0) && (
        <section className="mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Requests {extReqsComponents.length} {extReqsComponents.length > 0 || prjInvites?.length  > 0}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {extReqsComponents.map((component) => component)}
              <PrjInvites invites={prjInvites} orgId={orgId} />
            </div>
          </div>
        </section>
      )}

      {extensions.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Extensions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {extensions.map((extension) => {
              return (
                <Card key={extension.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>{tDB(extension.name)}</CardTitle>
                    <CardDescription>
                      {tDB(extension.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    <Link href={EXTENSION(orgId, extension.id)}>
                      <Button asChild variant="outline">
                        Run
                        <SquarePlay />
                      </Button>
                    </Link>
                    {extension.showSettings && (
                      <Link href={EXTENSION_SETTINGS(orgId, extension.id)}>
                        <Button asChild className="ml-2" variant="outline">
                          <Settings />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
