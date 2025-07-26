import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();
    const {
      orgId,
      role,
      projectRoleName,
      reason,
      minMembers,
      matchNoCommonSkills,
      skillsToAdd,
      skillsToDelete,
    } = await request.json();

    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    await autoAlloc.applySettings(
      role,
      projectRoleName,
      reason,
      minMembers,
      matchNoCommonSkills,
    );
    for (const skillName of skillsToAdd) {
      await autoAlloc.createSkill(skillName);
    }

    for (const skill of skillsToDelete) {
      await autoAlloc.deleteSkill(skill);
    }

    return new Response(null, { status: 201 });
  } catch (e) {
    console.trace(e);
    return new Response(
      JSON.stringify({
        error: prettifyPBError(e.data) || e.message || e.toString(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
