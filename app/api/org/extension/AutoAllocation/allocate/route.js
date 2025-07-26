import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();
    const { orgId, projectIds, requestIds } = await request.json();

    if (!projectIds || !requestIds) {
      throw new Error("Missing required fields: projectIds or requestIds");
    }

    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    const assignments = await autoAlloc.allocate(projectIds, requestIds);

    return new Response(
      JSON.stringify({
        assignments: assignments,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.trace(error);
    return new Response(
      JSON.stringify({
        error: prettifyPBError(error.data) || error.message || error.toString(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
