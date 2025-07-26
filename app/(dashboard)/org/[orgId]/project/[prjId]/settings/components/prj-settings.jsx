"use client";
import Link from "next/link";
import { useOrgData } from "@/(dashboard)/org/[orgId]/context";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Label } from "@/components/label";
import { Badge } from "@/components/badge";
import { Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/card";
import TemplateList from "@/(dashboard)/org/[orgId]/create-project/template-list";
import RolesList from "@/(dashboard)/create/components/roles-list";
import TaskStatusesList from "@/(dashboard)/org/[orgId]/create-project/task-statuses-list";
import ExtensionsList from "@/(dashboard)/create/components/extensions-list";

import {
  API_CREATE_PRJ_ROLE,
  API_EDIT_PRJ_ROLE,
  API_DELETE_PRJ_ROLE,
  API_EDIT_PRJ_STATUS,
  API_CREATE_PRJ_STATUS,
  API_DELETE_PRJ_STATUS,
  API_UPDATE_DONE_STATUS,
  API_UPDATE_PRJ,
  API_PRJ_EXTENSION_ADD,
  API_PRJ_EXTENSION_DELETE,
} from "@/constants/api-routes";
import { PRJ_DASHBOARD, PRJ_MEMBERS } from "@/constants/page-routes";
import { PRJ_PERMISSIONS } from "@/../templates/permissions";

export default function ProjectSettingsForm({
  showManageMembers,
  projectTemplates,
  prjRoles,
  prjStatuses,
  availableExtensions,
  prjExts,
}) {
  const router = useRouter();
  const { orgId, prjId } = useParams();
  const { getProjectById } = useOrgData();

  const initialData = getProjectById(prjId);
  const currTemplate = projectTemplates.find(
    (t) => t.id === initialData?.project_template,
  );

  const [projectData, setProjectData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    template: currTemplate || null,
    roles: prjRoles,
    tasks: prjStatuses,
    extensions: prjExts,
  });
  const [doneIndex, setDoneIndex] = useState(
    prjStatuses.findIndex((s) => s.id === initialData.done_status),
  );

  async function handleSelectedDoneTaskIndex(index) {
    try {
      setIsLoading(true);
      const statusId = projectData.tasks[index]?.id;
      const response = await fetch(API_UPDATE_DONE_STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          projectId: prjId,
          statusId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update done status");
      }
      setDoneIndex(index);
      toast({
        title: "Done status updated successfully",
      });
    } catch (error) {
      console.error("Error updating done status:", error);
      toast?.({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading?.(false);
    }
  }

  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateChange = async (template) => {
    if (!template) {
      setProjectData((prev) => ({ ...prev, template }));
      return;
    }
    setIsLoading(true);
    try {
      const { roles, extensions, tasks } = projectData;
      const existingRoleNames = new Set(roles.map((r) => r.name));
      const existingExtIds = new Set(extensions.map((e) => e.id));
      const existingTaskNames = new Set(tasks.map((t) => t.name));

      // Filter new items
      const newRoles = template.projectRoles.filter(
        (role) => !existingRoleNames.has(role.name),
      );
      const newTasks = template.task_statuses.filter(
        (task) => !existingTaskNames.has(task.name),
      );

      // Create roles and tasks in parallel
      const [createdRoles, createdTasks] = await Promise.all([
        // Create roles
        Promise.all(
          newRoles.map(async (role) => {
            const res = await fetch(API_CREATE_PRJ_ROLE, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orgId,
                projectId: prjId,
                role: {
                  name: role.name,
                  is_admin: role.is_admin,
                  perms: role.perms,
                  color: role.color,
                },
              }),
            });
            if (!res.ok) throw new Error(`Failed to create role: ${role.name}`);
            const { id } = await res.json();
            return { ...role, id };
          }),
        ),
        // Create tasks
        Promise.all(
          newTasks.map(async (task) => {
            const res = await fetch(API_CREATE_PRJ_STATUS, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orgId,
                projectId: prjId,
                status: {
                  name: task.name,
                  description: task.description,
                },
              }),
            });
            if (!res.ok)
              throw new Error(`Failed to create task status: ${task.name}`);
            const { id } = await res.json();
            return { ...task, id };
          }),
        ),
      ]);

      // Update state with roles and tasks
      setProjectData((prev) => ({
        ...prev,
        template,
        roles: [...prev.roles, ...createdRoles],
        tasks: [...prev.tasks, ...createdTasks],
      }));

      // Handle extensions sequentially
      const newExts =
        template.extensions?.filter((ext) => !existingExtIds.has(ext.id)) || [];

      // Update state with extensions
      setProjectData((prev) => ({
        ...prev,
        extensions: [...prev.extensions, ...newExts],
      }));

      toast({ title: "Template Applied Successfully" });
    } catch (error) {
      console.error("Error applying template:", error);
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRoles = async (updatedRoles) => {
    const currentRoleIds = projectData.roles.map((r) => r.id);
    const updatedRoleIds = updatedRoles.map((r) => r.id);

    try {
      setIsLoading(true);
      let response;

      if (currentRoleIds.some((id) => !updatedRoleIds.includes(id))) {
        // Delete
        response = await fetch(API_DELETE_PRJ_ROLE, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            roleId: currentRoleIds.find((id) => !updatedRoleIds.includes(id)),
          }),
        });
      } else if (
        updatedRoles.some((role) => !currentRoleIds.includes(role.id))
      ) {
        // Create
        const newRole = updatedRoles.find(
          (role) => !currentRoleIds.includes(role.id),
        );
        response = await fetch(API_CREATE_PRJ_ROLE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            role: {
              name: newRole.name,
              is_admin: newRole.is_admin,
              perms: newRole.perms,
              color: newRole.color,
            },
          }),
        });
        if (response.ok) {
          const { id } = await response.json();
          newRole.id = id;
        }
      } else {
        // Update first changed role
        const changedRole = updatedRoles.find(
          (role) =>
            JSON.stringify(role) !==
            JSON.stringify(projectData.roles.find((r) => r.id === role.id)),
        );
        response = await fetch(API_EDIT_PRJ_ROLE, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            role: changedRole,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update roles");
      }

      setProjectData((prev) => ({ ...prev, roles: updatedRoles }));
      toast({ title: "Roles Updated Successfully" });
    } catch (error) {
      console.error("Error managing roles:", error);
      toast({ title: error.message, variant: "destructive" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTasks = async (updatedTasks) => {
    const currentTaskIds = projectData.tasks.map((t) => t.id);
    const updatedTaskIds = updatedTasks.map((t) => t.id);

    try {
      setIsLoading(true);
      let response;

      if (currentTaskIds.some((id) => !updatedTaskIds.includes(id))) {
        // Delete
        response = await fetch(API_DELETE_PRJ_STATUS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            statusId: currentTaskIds.find((id) => !updatedTaskIds.includes(id)),
          }),
        });
      } else if (
        updatedTasks.some((task) => !currentTaskIds.includes(task.id))
      ) {
        // Create
        const newTask = updatedTasks.find(
          (task) => !currentTaskIds.includes(task.id),
        );
        response = await fetch(API_CREATE_PRJ_STATUS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            status: {
              name: newTask.name,
              description: newTask.description,
            },
          }),
        });

        if (response.ok) {
          const { id } = await response.json();
          newTask.id = id;
        }
      } else {
        // Update first changed task
        const changedTask = updatedTasks.find(
          (task) =>
            JSON.stringify(task) !==
            JSON.stringify(projectData.tasks.find((t) => t.id === task.id)),
        );

        response = await fetch(API_EDIT_PRJ_STATUS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            projectId: prjId,
            statusId: changedTask.id,
            status: {
              name: changedTask.name,
              description: changedTask.description,
            },
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tasks");
      }

      setProjectData((prev) => ({ ...prev, tasks: updatedTasks }));
      toast({ title: "Tasks Updated Successfully" });
    } catch (error) {
      console.error("Error managing tasks:", error);
      toast({ title: error.message, variant: "destructive" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExtension = async (newExtension) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_PRJ_EXTENSION_ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, projectId: prjId, ext: newExtension }),
      });

      if (!response?.ok) {
        throw new Error("Failed to add extension");
      }

      setProjectData((prev) => ({
        ...prev,
        extensions: [...prev.extensions, newExtension],
      }));
      toast({ title: "Extension Added Successfully" });
    } catch (error) {
      console.error("Error adding extension:", error);
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExtension = async (extensionId) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_PRJ_EXTENSION_DELETE, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, projectId: prjId, extId: extensionId }),
      });

      if (!response?.ok) {
        throw new Error("Failed to remove extension");
      }

      setProjectData((prev) => ({
        ...prev,
        extensions: prev.extensions.filter((ext) => ext.id !== extensionId),
      }));
      toast({ title: "Extension Removed Successfully" });
    } catch (error) {
      console.error("Error removing extension:", error);
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!projectData.name || projectData.name.trim().length < 4) {
        throw new Error("Name must be at least 4 characters long");
      }

      const response = await fetch(API_UPDATE_PRJ, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          projectId: prjId,
          name: projectData.name,
          description: projectData.description,
          project_template: projectData.template?.id || null,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "Failed to update project settings");
      }

      toast({ title: "Project updated successfully", variant: "default" });
      router.refresh();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl">
      <CardHeader className="pt-0 px-0 flex flex-row justify-between">
        <div className="flex items-center gap-2">
          <Link href={PRJ_DASHBOARD(orgId, prjId)}>
            <ArrowLeft className="h-8 w-8" />
          </Link>
          <CardTitle className="text-2xl">Project Settings</CardTitle>
        </div>
        {showManageMembers && (
          <Link href={PRJ_MEMBERS(orgId, prjId)}>
            <Button variant="outline">
              <Users className="w-4 h-4" />
              Manage Members
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="pl-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={projectData.name}
            onChange={(e) =>
              setProjectData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={projectData.description}
            onChange={(e) =>
              setProjectData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
          />
        </div>
      </CardContent>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4">Templates</h2>
            <TemplateList
              templates={projectTemplates}
              onSelectTemplate={handleTemplateChange}
              selectedTemplateId={projectData.template?.id}
            />
            <h3 className="text-2xl font-semibold mb-2 mt-4">
              Available Extensions
            </h3>
            {availableExtensions.map((extension) => {
              const isSelected = projectData.extensions.some(
                (e) => e.id === extension.id,
              );
              return (
                <Card
                  key={extension.id}
                  className={`mb-4 transition-colors cursor-pointer ${isSelected
                      ? "border-blue-500 dark:border-blue-500 bg-accent"
                      : ""
                    }`}
                  onClick={() => {
                    if (isSelected) return;
                    handleAddExtension({
                      id: extension.id,
                      config: {
                        reason: extension.desc,
                      },
                    });
                  }}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      <Badge className="text-md">{extension.id}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{extension.desc}</CardContent>
                </Card>
              );
            })}
          </div>
          <div className="w-full lg:w-2/3 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Roles</h2>
            <RolesList
              allPerms={PRJ_PERMISSIONS}
              roles={projectData.roles}
              onRolesChange={handleSetRoles}
            />
            <h2 className="text-2xl font-bold my-4">Task Statuses</h2>
            <TaskStatusesList
              tasks={projectData.tasks}
              setTasks={handleSetTasks}
              selectedDoneTaskIndex={doneIndex}
              setSelectedDoneTaskIndex={handleSelectedDoneTaskIndex}
            />
            <h2 className="text-2xl font-bold my-4">Extensions</h2>
            <ExtensionsList
              extensions={projectData.extensions}
              onDeleteExtension={handleRemoveExtension}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-6 relative z-100"
        disabled={!projectData.name.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating Project
          </>
        ) : (
          "Update Project"
        )}
      </Button>
    </form>
  );
}
