"use client";
import { useState, useRef } from "react";
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
import ProjectSkillsDialog from "./project-skills-dialog";

export default function ProjectRequestCard({
  currentSkills,
  allSkills,
  orgId,
  prjId,
  projectSkillId,
  prjName,
  prjDesc,
}) {
  const tDB = useDBTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [skills, setSkills] = useState(currentSkills || []);

  const handleSaveSkills = (projectId, newSkills) => {
    setSkills(newSkills);
  };

  return (
    <div key={prjId}>
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Update Project Skills</CardTitle>
          <CardDescription>Current Skills</CardDescription>
          <div className="flex gap-2 flex-wrap">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="outline">
                {skill.title}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)}>Update Data</Button>
        </CardContent>
      </Card>
      <ProjectSkillsDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projectId={prjId}
        projectSkillId={projectSkillId}
        projectName={prjName}
        projectDesc={prjDesc}
        currentSkills={skills}
        onSave={handleSaveSkills}
        allSkills={allSkills}
        orgId={orgId}
      />
    </div>
  );
}
