"use client";
import { useState } from "react";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { ORG_PERMISSIONS } from "@/../templates/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";
import TemplateList from "./template-list.jsx";
import RolesList from "./roles-list.jsx";
import ExtensionsList from "./extensions-list.jsx";

export default function TemplateSelector({
  selectedTemplate,
  handleSelectedTemplate,
  roles,
  setRoles,
  extensions,
  availableExtensions,
  setExtensions,
  templates,
  canManageRoles,
}) {
  const tDB = useDBTranslation();

  const handleSelectTemplate = (template) => {
    if (template) {
      template.orgRoles = template.orgRoles.map((r) => ({
        ...r,
        id: crypto.randomUUID(),
        name: tDB(r.name),
      }));
      handleSelectedTemplate(template);
    } else {
      handleSelectedTemplate(null);
    }
  };
  const onRolesChange = (roles) => {
    setRoles(roles);
  };
  const onDeleteExtension = (extensionId) => {
    const updatedExt = extensions.filter((ext) => ext.id !== extensionId);
    setExtensions(updatedExt);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/3">
        {templates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Templates</h2>
            <TemplateList
              templates={templates}
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
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
        {canManageRoles && (
          <>
            <h2 className="text-2xl font-bold mb-4">Roles</h2>
            <RolesList
              allPerms={ORG_PERMISSIONS}
              roles={roles}
              onRolesChange={onRolesChange}
            />
          </>
        )}
        <h2 className="text-2xl font-bold my-4">Extensions</h2>
        <ExtensionsList
          extensions={extensions}
          onDeleteExtension={onDeleteExtension}
        />
      </div>
    </div>
  );
}
