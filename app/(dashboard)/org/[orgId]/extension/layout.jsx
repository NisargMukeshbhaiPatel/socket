import { redirect } from "next/navigation";
import { headers } from "next/headers";

import PBUser from "@/lib/pb/user";
import { VIEW_EXTENSIONS, MANAGE_EXTENSIONS } from "@/../templates/permissions";
import { ORG_DASHBOARD } from "@/constants/page-routes";
import { getOrgExtPerms } from "@/lib/exts";

export default async function OrgPageLayout({ params, children }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);

  const [canManageExtensions, canUseExtensions] = await Promise.all([
    pbOrg.iHavePermission(MANAGE_EXTENSIONS),
    pbOrg.iHavePermission(VIEW_EXTENSIONS),
  ]);
  if (!canUseExtensions && !canManageExtensions) {
    redirect(ORG_DASHBOARD(orgId));
  }

  const url = (await headers()).get("x-url");
  const extensionId = url.match(/\/extension\/([^\/]+)/)?.[1];
  const permissions = await getOrgExtPerms(pbOrg.pb, extensionId);
  const haveRequiredPerms = await (async () => {
    for (const perm of permissions) {
      if (!(await pbOrg.iHavePermission(perm))) {
        return false;
      }
    }
    return true;
  })();
  if (!haveRequiredPerms) {
    redirect(ORG_DASHBOARD(orgId));
  }

  return children;
}
