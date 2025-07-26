import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function PATCH(request) {
  try {
    const { orgId, role } = await request.json();
    const { id, name, is_admin, perms, color } = role;
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);

    await pbOrg.editRole(id, name, is_admin, perms, color);

    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR in edit Role", e.data || e);
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
