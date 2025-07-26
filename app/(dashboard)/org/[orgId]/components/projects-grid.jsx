"use client"
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { PRJ_DASHBOARD } from "@/constants/page-routes";
import { useOrgData } from "../context";

const ProjectsGrid = () => {
  const { currentOrgId, projects } = useOrgData();

  return (
    <div>
      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center">
          <CardHeader>
            <CardDescription className="text-center">
              No projects yet
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              href={PRJ_DASHBOARD(currentOrgId, project.id)}
              key={project.id}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsGrid;
