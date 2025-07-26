import Link from "next/link";
import PBOrg from "@/lib/pb/org";
import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";

import SettingsComponent from "./settings";

export default async function AutoAllocationExtPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const autoAlloc = await AutoAllocation.get(pbOrg);

  const settings = await autoAlloc.getSettings();
  const allSkills = (await autoAlloc.getAllSkills()) || [];

  return (
    <SettingsComponent
      orgId={orgId}
      allSkills={allSkills.map((skill) => ({
        title: skill.title,
        id: skill.id,
      }))}
      settings={{
        assignedRoleId: settings.assign_role,
        prjRoleName: settings.project_role_name,
        reason: settings.reason,
        minMembersPerProject: settings.min_members,
        matchMembersWithNoCommonSkills:
          settings.match_members_with_no_common_skills,
      }}
    />
  );
}
