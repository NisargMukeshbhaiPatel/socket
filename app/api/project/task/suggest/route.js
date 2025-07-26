import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, prjId } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const prj = await pbOrg.getProject(prjId);

    const suggestions = await prj.suggestTasks();

    return new Response(JSON.stringify({ tasks: suggestions || [] }), {
      status: 201,
    });
  } catch (e) {
    console.log(e.data || e);
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
