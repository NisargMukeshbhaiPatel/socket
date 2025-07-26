import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();
    const { orgId, skillId, userName, userData } = await request.json();

    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    const result = await autoAlloc.generateUserSkills(
      userName,
      userData,
    );
    console.log("auto gen result", result);

    return new Response(JSON.stringify({skills: result || []}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
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
