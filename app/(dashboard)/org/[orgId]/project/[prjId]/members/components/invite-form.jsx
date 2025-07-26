"use client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/(dashboard)/context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";
import MembersTable from "./members-table";
import {
  API_SEND_PRJ_INVITE,
  API_ORG_UPDATE_MEMBER_ROLES,
} from "@/constants/api-routes";

export default function InviteForm({
  name,
  orgId,
  prjId,
  orgMembers: initialMembers,
  prjRoles: roles,
}) {
  const { getRolesByOrgId } = useData();
  const orgRoles = getRolesByOrgId(orgId);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const form = useForm({
    defaultValues: {
      roles: [],
    },
  });

  const handleSelectMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      // Get all visible members from the table (considering filters)
      const allVisibleMemberIds = members.map((member) => member.id);
      setSelectedMembers(allVisibleMemberIds);
    } else {
      setSelectedMembers([]);
    }
  };

  async function onSubmit(values) {
    if (selectedMembers.length === 0) {
      toast({
        title: "Please select at least one member",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_SEND_PRJ_INVITE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          projectId: prjId,
          memberIds: selectedMembers,
          roleIds: values.roles,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast({
          title: "The invitation was successfully sent.",
        });
        form.reset();
        setSelectedMembers([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }
    } catch (error) {
      toast({
        title: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Org Members to {name}</CardTitle>
        <CardDescription>
          Select org members and assign roles to invite them to the project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MembersTable
              orgId={orgId}
              members={members}
              roles={orgRoles}
              updateRolesAPI={API_ORG_UPDATE_MEMBER_ROLES}
              setMembers={setMembers}
              selectedMembers={selectedMembers}
              onSelectMember={handleSelectMember}
              onSelectAll={handleSelectAll}
            />

            <div className="flex space-x-4">
              <div className="flex-grow space-y-6">
                {roles.length > 0 && (
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Roles</FormLabel>
                        <FormDescription>
                          Select the project roles you want to assign to the
                          selected members.
                        </FormDescription>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {roles.map((role, i) => (
                              <Badge
                                key={i}
                                style={{ backgroundColor: role.color }}
                                className={cn(
                                  "cursor-pointer transition-all duration-200 ease-in-out",
                                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                                  field.value.includes(role.id)
                                    ? "ring-2 ring-offset-2 ring-blue-500 shadow-md"
                                    : "",
                                )}
                                onClick={() => {
                                  const updatedRoles = field.value.includes(
                                    role.id,
                                  )
                                    ? field.value.filter((id) => id !== role.id)
                                    : [...field.value, role.id];
                                  field.onChange(updatedRoles);
                                }}
                              >
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="lg"
                  type="submit"
                  disabled={isLoading || selectedMembers.length === 0}
                >
                  {isLoading ? "Sending..." : "Send Invites"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
