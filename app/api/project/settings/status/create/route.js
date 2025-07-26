import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, projectId, status } = await request.json();
    const { name, description } = status;

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbPrj = await pbOrg.getProject(projectId);

    const newStatus = await pbPrj.createStatus(name, description);
    return new Response(JSON.stringify({ id: newStatus.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log("ERR in create Status", e.data || e);
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
