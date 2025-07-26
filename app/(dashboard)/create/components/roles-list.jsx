"use client";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ScrollArea } from "@/components/scroll-area";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";
import { Plus, Pencil, Trash, ShieldEllipsis } from "lucide-react";
import { RoleManagementModal } from "./role-management-modal";

export default function RolesList({ allPerms, roles, onRolesChange }) {
  const t = useTranslations("CreateOrgForm");
  const tPerm = useTranslations("Permissions");
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const openAddRoleModal = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSaveRole = (role) => {
    if (!role.name.trim()) {
      toast({
        title: "Role name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    if (editingRole) {
      const updatedRoles = roles.map((r) =>
        r.id === editingRole.id ? { ...role, id: editingRole.id } : r,
      );
      onRolesChange(updatedRoles);
    } else {
      const updatedRoles = [...roles, { ...role, id: crypto.randomUUID() }];
      onRolesChange(updatedRoles);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRole = (roleId) => {
    const updatedRoles = roles.filter((role) => role.id !== roleId);
    onRolesChange(updatedRoles);
  };

  return (
    <>
      <div className="h-[300px] flex flex-col">
        {roles.length > 0 ? (
          <ScrollArea className="h-full">
            {roles.map((role) => (
              <Card key={role.id} className="mb-4">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Badge
                        className="text-md"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.name}
                      </Badge>
                      {role.isAdmin && (
                        <ShieldEllipsis className="w-4 h-4 ml-2 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        onClick={() => openEditRoleModal(role)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {role.perms.map((permission) => (
                      <Badge
                        variant="outline"
                        style={{ borderColor: role.color }}
                        key={permission}
                      >
                        {tPerm(permission)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        ) : (
          <Card className="mb-4 h-full">
            <CardHeader>
              <p className="text-muted-foreground">
                No roles yet. Add a custom role or select a template.
              </p>
            </CardHeader>
          </Card>
        )}
        <Button
          type="button"
          className="w-full"
          onClick={openAddRoleModal}
          variant="outline"
        >
          <Plus className="w-6 h-6 -ml-1" /> {t("addCustomRole")}
        </Button>
      </div>
      <RoleManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        initialRole={editingRole || undefined}
        allPerms={allPerms}
      />
    </>
  );
}
