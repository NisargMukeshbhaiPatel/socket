import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();

    const { orgId, requestId, data, skillIds, maxProjects } =
      await request.json();

    const pbOrg = await pbUser.getOrg(orgId);
    const ext = await AutoAllocation.get(pbOrg);
    await ext.fillSkills(requestId, data, skillIds, maxProjects);

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
