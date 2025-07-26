"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { EXTENSION_AUTOALLOC_ASSIGNMENT_HISTORY } from "@/constants/page-routes";
import { API_ORG_EXTENSION_AUTOALLOC_ASSIGN_MEMBERS_TO_PROJECTS } from "@/constants/api-routes";

export default function AssignmentResults({ assignments = [], orgId }) {
  const router = useRouter();
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectedAssignments(
      checked
        ? assignments.map((a, index) => ({
            index,
            memberSkills: a.memberSkills,
            projectSkills: a.projectSkills,
            memberId: a.memberId,
            projectId: a.projectId,
          }))
        : [],
    );
  };

  const handleSelectAssignment = (assignment, index, checked) => {
    setSelectedAssignments((prev) =>
      checked
        ? [
            ...prev,
            {
              index,
              memberSkills: a.memberSkills,
              projectSkills: a.projectSkills,
              memberId: assignment.memberId,
              projectId: assignment.projectId,
            },
          ]
        : prev.filter((a) => a.index !== index),
    );
  };

  const handleSubmit = async () => {
    if (selectedAssignments.length === 0) return;

    setIsLoading(true);
    try {
      const assignmentsToSubmit = selectedAssignments.map((assignment) => {
        //finnd the matched skill IDs for this specific assignment
        const matchedSkillIds = assignment.projectSkills
          .filter((projectSkill) =>
            assignment.memberSkills.some(
              (memberSkill) => memberSkill.id === projectSkill.id,
            ),
          )
          .map((matchedSkill) => matchedSkill.id);

        return {
          memberId: assignment.memberId,
          projectId: assignment.projectId,
          matchedSkillIds: matchedSkillIds,
        };
      });

      const response = await fetch(
        API_ORG_EXTENSION_AUTOALLOC_ASSIGN_MEMBERS_TO_PROJECTS,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orgId,
            assignments: assignmentsToSubmit,
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw result.error;
      }
      router.push(EXTENSION_AUTOALLOC_ASSIGNMENT_HISTORY(orgId));
    } catch (error) {
      console.error("Error during assigning members to projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full overflow-y-auto max-h-[calc(90vh-150px)]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="border-b">
              <TableHead className="w-[50px]">
                <Checkbox
                  id="select-all"
                  checked={selectedAssignments.length === assignments.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Member Assigned</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Project Skills</TableHead>
              <TableHead>Member Skills</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    id={`assignment-${index}`}
                    checked={selectedAssignments.some((a) => a.index === index)}
                    onCheckedChange={(checked) =>
                      handleSelectAssignment(assignment, index, checked)
                    }
                  />
                </TableCell>
                <TableCell>{assignment.memberName}</TableCell>
                <TableCell>{assignment.projectName}</TableCell>
                <TableCell className="">
                  <div className="flex flex-wrap gap-1 pr-12">
                    {assignment.projectSkills.map((skill) => (
                      <Badge
                        className="shrink-0"
                        key={skill.id}
                        variant={
                          assignment.memberSkills.some(
                            (memberSkill) => memberSkill.id === skill.id,
                          )
                            ? "primary"
                            : "secondary"
                        }
                      >
                        {skill.title}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="flex flex-wrap gap-1 pr-12">
                  {assignment.memberSkills?.map((skill) => (
                    <Badge
                      key={skill.id}
                      className="shrink-0"
                      variant={
                        assignment.projectSkills.some(
                          (projectSkill) => projectSkill.id === skill.id,
                        )
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {skill.title}
                    </Badge>
                  ))}
                </TableCell>

                <TableCell>{assignment.score}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-start">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || selectedAssignments.length === 0}
        >
          {isLoading ? "Assigning..." : "Assign Selected Members to Projects"}
        </Button>
      </div>
    </>
  );
}
