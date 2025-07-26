import PBUser from "@/lib/pb/user";
import { projectTemplates } from "@/lib/getTemplates";
import { getAllPrjExtensions } from "@/lib/exts.js";
import PrjSettings from "./components/prj-settings";
import { ADD_PRJ_MEMBERS, MANAGE_PRJ_MEMBERS } from "@/../templates/permissions";

export default async function PrjSettingsPage({ params }) {
  const { orgId, prjId } = await params;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const pbPrj = await pbOrg.getProject(prjId);

  //TODO: perms
  const [prjRoles, prjStatuses, availableExtensions] = await Promise.all([
    pbPrj.getAllRoles(),
    pbPrj.getAllStatuses(),
    getAllPrjExtensions(pbUser.pb),
  ]);
  const exts = await pbPrj.getAllAddedExtensions();

  const prjExts = await Promise.all(
    exts.map(async (ext) => ({
      id: ext.id,
      config: {
        reason: ext.getDesc(),
      },
    })),
  );

  const [addMembers, manageMembers] = await Promise.all([
    pbPrj.iHavePermission(ADD_PRJ_MEMBERS),
    pbPrj.iHavePermission(MANAGE_PRJ_MEMBERS)
  ]);

  return (
    <PrjSettings
      showManageMembers={addMembers || manageMembers}
      projectTemplates={projectTemplates}
      prjRoles={prjRoles}
      prjStatuses={prjStatuses}
      availableExtensions={availableExtensions}
      prjExts={prjExts}
    />
  );
}
