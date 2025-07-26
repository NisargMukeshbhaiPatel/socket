import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function DELETE(request) {
  try {
    const { orgId, projectId, extId } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbProj = await pbOrg.getProject(projectId);

    await pbProj.removeExtension(extId);

    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR in delete project extension", e.data || e);
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
