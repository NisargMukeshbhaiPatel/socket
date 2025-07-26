"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import MembersList from "./MembersList";
import ProjectsList from "./ProjectsList";
import AssignmentResults from "./AssignmentResults";
import { API_ORG_EXTENSION_AUTOALLOC_ALLOCATE } from "@/constants/api-routes";

export default function AssignForm({
  orgId,
  role,
  allSkills,
  pendingMembers,
  unassignedMembers,
  assignmentHistory,
  unassignedProjects,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const handleAssign = async () => {
    if (selectedMembers.length === 0 || selectedProjects.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_ORG_EXTENSION_AUTOALLOC_ALLOCATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          projectIds: selectedProjects,
          requestIds: selectedMembers,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw result.error;
      }

      console.log("Allocation Result:", result.assignments);
      const assignments = result.assignments
        .map(({ project, skills, request, score }, i) => {
          const {
            expand: { org_member },
          } = request;
          return {
            memberId: org_member.id,
            memberName: org_member.expand.user.name,
            memberSkills: request.expand.skills,
            projectId: project.id,
            projectName: project.name,
            projectSkills: skills,
            score,
          };
        })
        .sort((a, b) => a.memberName.localeCompare(b.memberName));
      console.log(assignments[0]);
      setAssignments(assignments);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error during allocation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 mt-12">
      <MembersList
        orgId={orgId}
        allSkills={allSkills}
        pendingMembers={pendingMembers}
        unassignedMembers={unassignedMembers}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
      />
      <ProjectsList
        orgId={orgId}
        role={role}
        assignmentHistory={assignmentHistory}
        allSkills={allSkills}
        unassignedProjects={unassignedProjects}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
      />
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleAssign}
          disabled={
            isLoading ||
            selectedMembers.length === 0 ||
            selectedProjects.length === 0
          }
        >
          {isLoading ? "Assigning..." : "Assign Members to Projects"}
        </Button>
        {assignments.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)}>Results</Button>
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Project Assignment Results
            </DialogTitle>
          </DialogHeader>
          <AssignmentResults assignments={assignments} orgId={orgId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
