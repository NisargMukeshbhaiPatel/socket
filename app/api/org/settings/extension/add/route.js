import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, ext } = await request.json();
    const { id, config } = ext;
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);

    await pbOrg.addExtension(id, config);

    return new Response(null, { status: 201 });
  } catch (e) {
    console.log("Error in adding ext", e.data || e);
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
