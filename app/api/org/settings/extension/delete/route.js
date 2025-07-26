import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function DELETE(request) {
  try {
    const { orgId, extId } = await request.json();
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    console.log("LOG EXT ID", extId);

    await pbOrg.removeExtension(extId);

    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR in delete ext", e.data || e);
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
