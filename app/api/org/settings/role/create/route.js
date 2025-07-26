import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, role } = await request.json();
    const { name, is_admin, perms, color } = role;
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);

    const newRole = await pbOrg.createRole(name, is_admin, perms, color);
    return new Response(JSON.stringify({ id: newRole.id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

    return new Response(null, { status: 201 });
  } catch (e) {
    console.log("ERR", e.originalError);
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
