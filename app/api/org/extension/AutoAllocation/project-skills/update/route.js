import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const res = await request.json();
    const { orgId, projectId, skillIds } = res;
    let projectSkillId = res.projectSkillId;

    if (!orgId || !Array.isArray(skillIds)) {
      throw new Error("Missing or invalid parameters");
    }

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    if (!projectSkillId) {
      const res = await autoAlloc.createProjectSkill(projectId, []);
      projectSkillId = res.id;
    }

    await autoAlloc.updateProjectSkill(projectSkillId, skillIds);

    return new Response(null, { status: 204 });
  } catch (e) {
    console.log(e.data || e);
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
