"use client";
import { useState, useRef } from "react";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Badge } from "@/components/badge";
import { Checkbox } from "@/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Input } from "@/components/input";
import EditMemberModal from "./edit-member-modal";

export default function MembersTable({
  orgId,
  members,
  setMembers,
  selectedMembers,
  onSelectMember,
  onSelectAll,
  apiData = {},
  roles,
  updateRolesAPI,
}) {
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const roleFilters = roles?.map((role) => role.name) || [];

  const filteredMembers = members.filter(
    (member) =>
      (roleFilter === "All" ||
        member.roles?.some((role) => role.name === roleFilter)) &&
      (member.name?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.trim().toLowerCase())),
  );

  const allSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => selectedMembers.includes(member.id));

  const [editingMember, setEditingMember] = useState(null);
  const handleEditMember = (member, index) => {
    setEditingMember(member);
  };

  const handleUpdateMemberRoles = (memberId, updatedRoles) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, roles: updatedRoles } : member,
      ),
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between gap-2">
          <Input
            className="w-full"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-max min-w-28">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(checked)}
                />
              </TableHead>

              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => onSelectMember(member.id)}
                  />
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell className="flex gap-1 flex-wrap">
                  {member.roles?.map((role, i) => (
                    <Badge
                      key={i}
                      className="text-md"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name || null}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" type="button">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          roles={roles}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onUpdate={handleUpdateMemberRoles}
          orgId={orgId}
          updateRolesAPI={updateRolesAPI}
          apiData={apiData}
        />
      )}
    </>
  );
}
