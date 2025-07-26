import { orgTemplates } from "@/lib/getTemplates";
import PBUser from "@/lib/pb/user";
import OrganizationSettings from "./components/organization-settings";
import {
  MANAGE_EXTENSIONS,
  MANAGE_ROLES,
  ADD_MEMBERS,
  MANAGE_MEMBERS,
} from "@/../templates/permissions";
import { getAllOrgExtensions } from "@/lib/exts.js";

export default async function OrgSettings({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const [
    canEditOrg,
    canManageRoles,
    canManageExtensions,
    canAddMembers,
    canManageMembers,
  ] = await Promise.all([
    pbOrg.iHavePermission(""), // Admin-only
    pbOrg.iHavePermission(MANAGE_ROLES),
    pbOrg.iHavePermission(MANAGE_EXTENSIONS),
    pbOrg.iHavePermission(ADD_MEMBERS),
    pbOrg.iHavePermission(MANAGE_MEMBERS),
  ]);

  let availableExtensions = [];
  let orgExts = [];
  if (canManageExtensions) {
    const exts = await pbOrg.getAllAddedExtensions();
    [availableExtensions, orgExts] = await Promise.all([
      Promise.all((await getAllOrgExtensions(pbUser.pb)).map(async (extCont) => {
        const hasPerms = (await Promise.all(
          extCont.perms.map(async (perm) => await pbOrg.iHavePermission(perm)),
        )).every(Boolean);
        if (!hasPerms) return null;
        return extCont.ext;
      })),
      Promise.all(
        exts.map(async (ext) => ({
          id: ext.id,
          config: {
            reason: await ext.getDesc(),
          },
        })),
      ),
    ]);
  }

  return (
    <OrganizationSettings
      templates={canEditOrg ? orgTemplates : []}
      canEditOrg={canEditOrg}
      canManageRoles={canManageRoles}
      canManageExtensions={canManageExtensions}
      showMemberSettings={canAddMembers || canManageMembers}
      availableExtensions={availableExtensions.filter(Boolean)}
      orgExts={orgExts}
    />
  );
}
