"use client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRJ_PERMISSIONS } from "@/../templates/permissions";
import { API_CREATE_PRJ } from "@/constants/api-routes";
import {
  CREATE_PRJ,
  PRJ_DASHBOARD,
  ORG_DASHBOARD,
} from "@/constants/page-routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Textarea } from "@/components/textarea";
import { Badge } from "@/components/badge";

import TemplateList from "./template-list.jsx";
import TaskStatusesList from "./task-statuses-list.jsx";
import ExtensionsList from "@/(dashboard)/create/components/extensions-list";
import RolesList from "@/(dashboard)/create/components/roles-list";

export default function ProjectCreationForm({
  orgId,
  availableExtensions,
  projectTemplates,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [roles, setRoles] = useState([]);
  const [extensions, setExtensions] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [selectedDoneTaskIndex, setSelectedDoneTaskIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectTemplate = (template) => {
    if (template) {
      setSelectedTemplate(template);
      setRoles(
        template.projectRoles.map((r, i) => ({
          ...r,
          id: "tr" + i,
        })),
      );
      setTasks(
        template.task_statuses.map((t, i) => ({
          ...t,
          id: "ts" + i,
        })),
      );
      setExtensions(template.extensions || []);
    } else {
      setSelectedTemplate(null);
      setTasks([]);
    }
  };

  const onRolesChange = (roles) => {
    setRoles(roles);
  };

  const onDeleteExtension = (extensionId) => {
    setExtensions((prevExtensions) =>
      prevExtensions.filter((ext) => ext.id !== extensionId),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || name.trim().length < 4) {
        throw new Error("Name must be at least 4 characters long");
      }

      // Get the selected template data
      const template = projectTemplates.find((t) => t.id === selectedTemplate);

      setIsLoading(true);
      const response = await fetch(API_CREATE_PRJ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          name,
          description,
          templateId: selectedTemplate?.id,
          projectRoles: roles.map(({ id, ...rest }) => rest),
          taskStatuses: tasks.map(({ id, ...rest }) => rest),
          doneTaskIndex: selectedDoneTaskIndex,
          extensions: extensions,
        }),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error);
      }

      router.push(PRJ_DASHBOARD(orgId, res.prjId));
      router.refresh();
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl pb-10 sm:pb-0">
      <CardHeader className="pt-0 pl-0">
        <CardTitle className="text-2xl">Create New Project</CardTitle>
        <CardDescription>
          Enter the details for your new project
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            {projectTemplates.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Templates</h2>
                <TemplateList
                  templates={projectTemplates}
                  onSelectTemplate={handleSelectTemplate}
                  selectedTemplateId={selectedTemplate?.id}
                />
              </>
            )}
            <h3 className="text-2xl font-semibold mb-2 mt-4">
              Available Extensions
            </h3>
            {availableExtensions.map((extension) => {
              const isSelected = extensions.some((e) => e.id === extension.id);
              return (
                <Card
                  key={extension.id}
                  className={`mb-4 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-500 bg-accent"
                      : ""
                  }`}
                  onClick={() => {
                    if (isSelected) return;
                    setExtensions([
                      ...extensions,
                      {
                        id: extension.id,
                        config: {
                          reason: extension.desc,
                        },
                      },
                    ]);
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
              roles={roles}
              onRolesChange={onRolesChange}
            />
            <h2 className="text-2xl font-bold my-4">Task Statutes</h2>
            <TaskStatusesList
              tasks={tasks}
              setTasks={setTasks}
              selectedDoneTaskIndex={selectedDoneTaskIndex}
              setSelectedDoneTaskIndex={setSelectedDoneTaskIndex}
            />
            <h2 className="text-2xl font-bold my-4">Extensions</h2>
            <ExtensionsList
              extensions={extensions}
              onDeleteExtension={onDeleteExtension}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-6 relative z-100"
        disabled={!name.trim || isLoading}
      >
        {isLoading ? "Creating Project..." : "Create Project"}
      </Button>
    </form>
  );
}
