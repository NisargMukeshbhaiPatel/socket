"use client";
import { useState } from "react";
import { Button } from "@/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { MembersTable } from "./members-table";
import { ProjectSelectionModal } from "./project-selection-modal";

export default function MembersManagement({ orgId, orgMembers }) {
  const [members, setMembers] = useState(orgMembers);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedMembers(members.map((member) => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleAddToProjects = (selectedProjects) => {
    // API request to add the members to the selected projects
    console.log(
      "Adding members:",
      selectedMembers,
      "to projects:",
      selectedProjects,
    );
    ///REMOVE
    setSelectedMembers([]);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>

        <CardContent>
          <MembersTable
            members={members}
            setMembers={setMembers}
            selectedMembers={selectedMembers}
            onSelectMember={handleSelectMember}
            onSelectAll={handleSelectAll}
            orgId={orgId}
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={selectedMembers.length === 0}
            >
              Add Selected to Projects
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProjectSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectsSelected={handleAddToProjects}
      />
    </>
  );
}
