import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, projectId, statusId, status } = await request.json();
    const { name, description } = status;

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbPrj = await pbOrg.getProject(projectId);

    await pbPrj.editStatus(statusId, name, description);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR in edit Status", e.data || e);
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
