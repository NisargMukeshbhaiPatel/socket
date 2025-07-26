"use client";
import { useState } from "react";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Badge } from "@/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Input } from "@/components/input";

export default function InvitesManagement({ invitesList }) {
  const tDB = useDBTranslation();
  const [invites, setInvites] = useState(invitesList);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvites = invitesList.filter(
    (invite) =>
      (statusFilter === "All" || invite.status === statusFilter) &&
      invite.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Invites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between gap-2">
            <Input
              className="w-full"
              placeholder="Search invites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-max min-w-28">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.name}</TableCell>
                  <TableCell className="flex gap-1 flex-wrap">
                    {invite.roles?.map((role, i) => (
                      <Badge
                        key={i}
                        className="text-md"
                        style={{ backgroundColor: role.color }}
                      >
                        {tDB(role.name)}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {new Date(invite.updated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invite.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
