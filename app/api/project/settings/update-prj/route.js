import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function PATCH(request) {
  try {
    const { orgId, projectId, name, description, project_template } =
      await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbPrj = await pbOrg.getProject(projectId);

    await pbPrj.edit(name, description, project_template);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR in update project", e.data || e);
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
