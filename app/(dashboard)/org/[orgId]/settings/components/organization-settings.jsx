"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { useData } from "@/(dashboard)/context";
import { useParams } from "next/navigation";
import { convertToBase64 } from "@/lib/utils.js";
import { User, Upload, Users, ArrowLeft, Loader2, Import } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Label } from "@/components/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { CardHeader, CardTitle, CardContent } from "@/components/card";
import TemplateSelector from "@/(dashboard)/create/components/template-selector";
import {
  ORG_DATA_IMPORT,
  ORG_MEMBERS,
  ORG_DASHBOARD,
} from "@/constants/page-routes";
import {
  API_ORG_ICON,
  API_UPDATE_ORG_ICON,
  API_UPDATE_ORG,
  API_ORG_ROLE_CREATE,
  API_ORG_ROLE_DELETE,
  API_ORG_ROLE_EDIT,
  API_ORG_EXTENSION_DELETE,
  API_ORG_EXTENSION_ADD,
} from "@/constants/api-routes";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function OrganizationSettings({
  templates,
  orgExts,
  availableExtensions,
  canEditOrg,
  canManageRoles,
  canManageExtensions,
  showMemberSettings,
}) {
  const router = useRouter();
  const t = useTranslations("OrgSettings");
  const tDB = useDBTranslation();
  const { getOrgData, getRolesByOrgId } = useData();
  const params = useParams();
  const orgId = params.orgId;

  const initialData = getOrgData(orgId);
  const orgRoles = getRolesByOrgId(orgId);
  const currTemplate = templates.find(
    (t) => t.id === initialData?.org_template,
  );

  const [orgData, setOrgData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    template: currTemplate || null,
    roles: orgRoles,
    extensions: orgExts || [],
  });

  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIconChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({ title: t("invalidImage"), variant: "destructive" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: t("fileSizeExceeded"), variant: "destructive" });
      return;
    }

    try {
      const base64Result = await convertToBase64(file);

      const formData = new FormData();
      formData.append("icon", file);
      formData.append("orgId", orgId);
      setIconPreview(base64Result);
      setIconFile(file);

      const response = await fetch(API_UPDATE_ORG_ICON, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update organization icon");
      }

      toast({ title: "Icon updated", variant: "default" });
    } catch (error) {
      toast({ title: error.message, variant: "destructive" });
      setIconPreview(null);
      setIconFile(null);
      console.error("Error updating icon:", error);
    }
  };

  const handleTemplateChange = async (template) => {
    if (!template) {
      setOrgData((prev) => ({ ...prev, template }));
      return;
    }

    setIsLoading(true);
    try {
      const { roles, extensions } = orgData;
      const existingRoleNames = new Set(roles.map((r) => r.name));
      const existingExtIds = new Set(extensions.map((e) => e.id));

      // Filter new roles
      const newRoles = template.orgRoles.filter(
        (role) => !existingRoleNames.has(role.name),
      );
      // Await role creation first
      await Promise.all(
        newRoles.map(async (role) => {
          try {
            const res = await fetch(API_ORG_ROLE_CREATE, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orgId, role }),
            });

            if (!res.ok) throw new Error(`Failed to create role: ${role.name}`);
            const { id } = await res.json();
            role.id = id; // Update role with backend ID
            return role;
          } catch (err) {
            throw err;
          }
        }),
      );
      // Update frontend state with new roles first
      setOrgData((prev) => ({
        ...prev,
        template,
        roles: [...roles, ...newRoles],
      }));

      // Now process extensions (after roles are created as it could be used by ext)
      const newExts = template.extensions.filter(
        (ext) => !existingExtIds.has(ext.id),
      );
      // Await extension creation
      await Promise.all(
        newExts.map(async (ext) => {
          try {
            const res = await fetch(API_ORG_EXTENSION_ADD, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orgId, ext }),
            });

            if (!res.ok) {
              throw new Error(`Failed to create extension: ${ext.name}`);
            }
          } catch (err) {
            throw err;
          }
        }),
      );
      // Update frontend state with extensions
      setOrgData((prev) => ({
        ...prev,
        extensions: [...prev.extensions, ...newExts],
      }));

      toast({ title: "Template Applied Successfully" });
    } catch (error) {
      console.log("Error applying template:", error);
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRoles = async (updatedRoles) => {
    setIsLoading(true);
    const currentRoleIds = orgData.roles.map((r) => r.id);
    const updatedRoleIds = updatedRoles.map((r) => r.id);

    try {
      let response;

      // Check and execute one operation - delete, create, or update
      if (currentRoleIds.some((id) => !updatedRoleIds.includes(id))) {
        // Delete
        response = await fetch(API_ORG_ROLE_DELETE, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            roleId: currentRoleIds.find((id) => !updatedRoleIds.includes(id)),
          }),
        });
      } else if (
        updatedRoles.some((role) => !currentRoleIds.includes(role.id))
      ) {
        const role = updatedRoles.find(
          (role) => !currentRoleIds.includes(role.id),
        );
        // Create
        response = await fetch(API_ORG_ROLE_CREATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            role,
          }),
        });
        if (response.ok) {
          const { id } = await response.json();
          role.id = id;
        }
      } else {
        // Update first changed role
        const changedRole = updatedRoles.find(
          (role) =>
            JSON.stringify(role) !==
            JSON.stringify(orgData.roles.find((r) => r.id === role.id)),
        );
        response = await fetch(API_ORG_ROLE_EDIT, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId, role: changedRole }),
        });
      }

      if (!response.ok)
        throw new Error(`Operation failed: ${(await response.json()).error}`);

      setOrgData((prev) => ({ ...prev, roles: updatedRoles }));
      toast({ title: "Roles Updated Successfully" });
    } catch (error) {
      console.error("Error managing roles:", error);
      toast({ title: error.message, variant: "destructive" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetExtensions = async (updatedExtensions) => {
    const currentExtensions = orgData.extensions;

    try {
      setIsLoading(true);
      let response;

      // Check and execute one operation - add or remove
      if (
        updatedExtensions.some(
          (ext) => !currentExtensions.some((curr) => curr.id === ext.id),
        )
      ) {
        // Add first new extension
        const newExt = updatedExtensions.find(
          (ext) => !currentExtensions.some((curr) => curr.id === ext.id),
        );
        response = await fetch(API_ORG_EXTENSION_ADD, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId, ext: newExt }),
        });
      } else {
        // Remove first missing extension
        const removedExt = currentExtensions.find(
          (ext) => !updatedExtensions.includes(ext),
        );
        response = await fetch(API_ORG_EXTENSION_DELETE, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId, extId: removedExt.id }),
        });
      }

      if (!response?.ok) {
        throw new Error("Failed to update Extensions");
      }

      setOrgData((prev) => ({ ...prev, extensions: updatedExtensions }));
      toast({ title: "Extensions Updated Successfully" });
    } catch (error) {
      console.error("Error managing extensions:", error);
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_UPDATE_ORG, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          name: orgData.name,
          description: orgData.description,
          org_template: orgData.template?.id || null,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "Failed to update organization settings");
      }

      router.refresh();
      toast({ title: "Organization updated", variant: "default" });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="px-0 pt-0 mb-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={ORG_DASHBOARD(orgId)}>
            <ArrowLeft className="h-8 w-8" />
          </Link>
          <CardTitle className="text-2xl">
            {t("organizationSettings")}
          </CardTitle>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {canEditOrg && (
            <Link href={ORG_DATA_IMPORT(orgId)}>
              <Button variant="outline">
                <Import className="w-4 h-4 " />
                Data Import
              </Button>
            </Link>
          )}
          {showMemberSettings && (
            <Link href={ORG_MEMBERS(orgId)}>
              <Button variant="outline">
                <Users className="w-4 h-4" />
                {t("manageMembers")}
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      {canEditOrg && (
        <form className="mb-8">
          <CardContent className="pl-0">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 rounded-full border">
                      <AvatarImage
                        src={
                          iconPreview ||
                          (initialData.icon && API_ORG_ICON(orgId))
                        }
                        alt={t("orgIconAlt")}
                      />
                      <AvatarFallback className="text-4xl bg-primary/5">
                        {orgData.name.trim() ? (
                          orgData.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="w-12 h-12 text-primary/40" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      id="icon_file"
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(",")}
                      onChange={handleIconChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full"
                      htmlFor="icon_file"
                      asChild
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t("changeIcon")}
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">{t("orgName")}</Label>
                    <Input
                      id="orgName"
                      value={orgData.name}
                      onChange={(e) =>
                        setOrgData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgDescription">
                      {t("orgDescription")}
                    </Label>
                    <Textarea
                      id="orgDescription"
                      value={orgData.description}
                      onChange={(e) =>
                        setOrgData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      )}
      <TemplateSelector
        selectedTemplate={orgData.template}
        handleSelectedTemplate={handleTemplateChange}
        templates={templates}
        roles={orgData.roles}
        setRoles={handleSetRoles}
        extensions={orgData.extensions}
        setExtensions={handleSetExtensions}
        canManageRoles={canManageRoles}
        availableExtensions={availableExtensions}
      />

      {canEditOrg && (
        <Button
          className="w-full mt-4 relative"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("updating")}
            </>
          ) : (
            t("updateOrg")
          )}
        </Button>
      )}
    </>
  );
}
