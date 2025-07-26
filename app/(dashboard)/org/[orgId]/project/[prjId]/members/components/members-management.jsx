"use client";
import { useState } from "react";
import { Button } from "@/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import MembersTable from "./members-table";
import { API_PRJ_UPDATE_MEMBER_ROLES } from "@/constants/api-routes";

export default function MembersManagement({
  orgId,
  prjId,
  prjMembers,
  prjRoles,
}) {
  const [members, setMembers] = useState(prjMembers);
  const [selectedMembers, setSelectedMembers] = useState([]);

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Project Members</CardTitle>
        </CardHeader>

        <CardContent>
          <MembersTable
            members={members}
            setMembers={setMembers}
            selectedMembers={selectedMembers}
            onSelectMember={handleSelectMember}
            onSelectAll={handleSelectAll}
            roles={prjRoles}
            updateRolesAPI={API_PRJ_UPDATE_MEMBER_ROLES}
            apiData={{ prjId }}
            orgId={orgId}
          />
        </CardContent>
      </Card>
    </>
  );
}
