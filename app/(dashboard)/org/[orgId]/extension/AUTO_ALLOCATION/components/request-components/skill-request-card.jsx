"use client";
import { useState } from "react";
import { useDBTranslation } from "@/hooks/use-db-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import SkillProfileDialog from "./skill-profile-dialog";

export default function SkillRequestCard({ request, allSkills, orgId }) {
  const tDB = useDBTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Update Skill Profile</CardTitle>
          <CardDescription>
            Manage skills and project capacity settings
          </CardDescription>
          <div className="pt-1 flex gap-2 flex-wrap">
            {request.roles?.map((role, i) => (
              <Badge key={i} style={{ backgroundColor: role.color }}>
                {tDB(role.name)}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)}>Update Data</Button>
        </CardContent>
      </Card>

      <SkillProfileDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        initialData={{
          skills: request.skills,
          maxProjects: request.maxProjects,
          description: request.data,
        }}
        allSkills={allSkills}
        orgId={orgId}
        requestId={request.id}
        userName={request.name}
      />
    </>
  );
}
