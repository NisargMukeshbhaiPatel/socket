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
import EmailTagInput from "./email-tag-input";
import { API_SEND_INVITE } from "@/constants/api-routes";

export default function InviteForm({ orgId }) {
  const router = useRouter();
  const tDB = useDBTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { getRolesByOrgId } = useData();
  const roles = getRolesByOrgId(orgId);

  const form = useForm({
    defaultValues: {
      emails: [],
      roles: [],
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);

    try {
      const response = await fetch(API_SEND_INVITE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          emails: values.emails,
          roleIds: values.roles,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast({
          title: "The invitation was successfully sent.",
        });
        form.reset();
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
        <CardTitle>Invite New Member</CardTitle>
        <CardDescription>Send an invitation to join your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Addresses</FormLabel>
                  <FormControl>
                    <EmailTagInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <div className="flex-grow space-y-6">
                {roles.length > 0 && (
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Roles</FormLabel>
                        <FormDescription>
                          Select the roles you want to assign to the invited
                          member.
                        </FormDescription>
                        <FormControl>
                          <div className="flex flex-wrap gap-2 mt-16">
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
                                {tDB(role.name)}
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
                  disabled={isLoading}
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
