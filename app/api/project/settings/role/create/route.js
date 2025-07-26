import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, projectId, role } = await request.json();
    const { name, is_admin, perms, color } = role;

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbPrj = await pbOrg.getProject(projectId);

    const newRole = await pbPrj.createRole(name, is_admin, perms, color);
    return new Response(JSON.stringify({ id: newRole.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log("ERR in create Role", e.data || e);
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
