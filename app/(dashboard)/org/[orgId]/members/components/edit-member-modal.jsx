"use client";
import { API_ORG_UPDATE_MEMBER_ROLES } from "@/constants/api-routes";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/badge";

export default function EditMemberModal({
  member,
  roles,
  isOpen,
  onClose,
  onUpdate,
  orgId,
}) {
  const [selectedRoles, setSelectedRoles] = useState(member.roles || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRole = (role) => {
    setSelectedRoles((prev) => [...prev, role]);
  };

  const handleRemoveRole = (roleId) => {
    setSelectedRoles((prev) => prev.filter((role) => role.id !== roleId));
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ORG_UPDATE_MEMBER_ROLES, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          roles: selectedRoles.map((r) => r.id),
          orgId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update roles");
      }

      onUpdate(member.id, selectedRoles);
      onClose();
    } catch (error) {
      console.error("Error updating roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = roles.filter(
    (role) => !selectedRoles.some((r) => role.id === r.id),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {member.name} Roles</DialogTitle>
          <DialogDescription className="sr-only">
            Update roles for {member.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pb-4">
          <div className="grid gap-2">
            <Label htmlFor="roles">Available Roles</Label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <Badge
                  className="cursor-pointer"
                  key={role.id}
                  style={{ backgroundColor: role.color }}
                  onClick={() => handleAddRole(role)}
                  disabled={isLoading}
                >
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Selected Roles</Label>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role) => (
                <Badge
                  key={role.id}
                  className="cursor-pointer"
                  style={{ backgroundColor: role.color }}
                >
                  {role.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-transparent"
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={isLoading}
                  >
                    <X />
                    <span className="sr-only">Remove {role.name} role</span>
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="w-full"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating roles...
              </>
            ) : (
              "Update roles"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
