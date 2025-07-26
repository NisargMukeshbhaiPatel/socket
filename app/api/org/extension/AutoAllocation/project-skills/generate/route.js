import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();
    const res = await request.json();
    const { orgId, projectId, projectName, projectDescription } = res;
    let projectSkillId = res.projectSkillId;

    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    if (!projectSkillId) {
      const res = await autoAlloc.createProjectSkill(projectId, []);
      projectSkillId = res.id;
    }
    const skills = await autoAlloc.generateProjectSkills(
      projectSkillId,
      projectName,
      projectDescription,
    );

    return new Response(JSON.stringify(skills), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
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
