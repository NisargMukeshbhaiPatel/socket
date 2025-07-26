"use client";
import { toast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { Input } from "@/components/input";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Badge } from "@/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import PendingDataModal from "./PendingDataModal";
import SkillProfileDialog from "./request-components/skill-profile-dialog";

export default function MembersList({
  orgId,
  allSkills,
  unassignedMembers,
  selectedMembers,
  setSelectedMembers,
  pendingMembers,
}) {
  const tDB = useDBTranslation();
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Skill modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const handleSkillModalOpen = (member) => {
    console.log("Opening skill modal for member:", member.skills);
    setSelectedMember(member);
    setIsSkillModalOpen(true);
  };

  const handleSkillModalClose = (open) => {
    setIsSkillModalOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMembers(unassignedMembers.map((member) => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const allSelected =
    unassignedMembers.length > 0 &&
    selectedMembers.length === unassignedMembers.length;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <h2 className="text-2xl inline-block font-semibold">Select Members</h2>
        <Button onClick={() => setShowPendingModal(true)} variant="outline">
          View Pending Data Requests
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Skillsets</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Max Projects</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unassignedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => handleMemberToggle(member.id)}
                  />
                </TableCell>
                <TableCell>
                  <label
                    htmlFor={`member-${member.id}`}
                    className="cursor-pointer"
                  >
                    {member.name}
                  </label>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.title}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="flex gap-1 flex-wrap">
                  {member.roles?.map((role, i) => (
                    <Badge
                      key={i}
                      className="text-xs"
                      style={{ backgroundColor: role.color }}
                    >
                      {tDB(role.name)}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{member.maxProjects}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkillModalOpen(member)}
                    title="Edit Member details"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPendingModal && (
        <PendingDataModal
          orgId={orgId}
          pendingMembers={pendingMembers}
          allSkills={allSkills}
          onClose={() => setShowPendingModal(false)}
        />
      )}
      {selectedMember && (
        <SkillProfileDialog
          isOpen={isSkillModalOpen}
          onOpenChange={handleSkillModalClose}
          initialData={{
            skills: selectedMember.skills,
            maxProjects: selectedMember.maxProjects,
            description: selectedMember.data,
          }}
          allSkills={allSkills}
          orgId={orgId}
          requestId={selectedMember.id}
          userName={selectedMember.name}
        />
      )}
    </div>
  );
}
