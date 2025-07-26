"use client";
import { toast } from "@/hooks/use-toast";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_SEND } from "@/constants/api-routes";
import { Pencil } from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import SkillProfileDialog from "./request-components/skill-profile-dialog";

export default function PendingDataModal({
  pendingMembers,
  allSkills,
  onClose,
  orgId,
}) {
  const tDB = useDBTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const sendRequest = async (id) => {
    try {
      const response = await fetch(
        API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_SEND,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId: orgId, memberId: id }),
        },
      );
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res?.error || "Failed to send ext data request");
      }
    } catch (err) {
      throw err;
    }
  };

  const sendOneRequest = async (id) => {
    setIsLoading(true);
    try {
      await sendRequest(id);
      toast({
        title: "Request sent successfully",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const sendRequestToAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all(
        pendingMembers.map(async (member) => {
          if (!member.found) await sendRequest(member.id);
        }),
      );
      toast({
        title: "Requests sent successfully to all members",
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillModalOpen = (member) => {
    if (!member.found) {
      toast({
        title: "Please send the data request to the member first",
      });
      return;
    }
    setSelectedMember(member);
    setIsSkillModalOpen(true);
  };

  const handleSkillModalClose = (open) => {
    setIsSkillModalOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Skill Requests</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Skillsets</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Max Projects</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMembers.map((mem) => (
                  <TableRow key={mem.id}>
                    <TableCell>{mem.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mem.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill.title}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-1 flex-wrap">
                      {mem.roles?.map((role, i) => (
                        <Badge
                          key={i}
                          className="text-md"
                          style={{ backgroundColor: role.color }}
                        >
                          {tDB(role.name)}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{mem.maxProjects}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendOneRequest(mem.id)}
                          disabled={mem.found}
                        >
                          {mem.found ? "Sent" : "Send Request"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkillModalOpen(mem)}
                          title="Edit Member details"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={sendRequestToAll}
              disabled={isLoading}
              className="w-full"
            >
              Send Request to All
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {selectedMember && (
        <SkillProfileDialog
          isOpen={isSkillModalOpen}
          onOpenChange={handleSkillModalClose}
          initialData={{
            skills: selectedMember.skills || [], //should be empty as in pending list
            maxProjects: selectedMember.maxProjects,
            description: selectedMember.data,
          }}
          allSkills={allSkills}
          orgId={orgId}
          requestId={selectedMember.requestId}
          userName={selectedMember.name}
        />
      )}
    </>
  );
}
