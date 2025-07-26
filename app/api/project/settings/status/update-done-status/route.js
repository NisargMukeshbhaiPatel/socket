import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, projectId, statusId } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const prj = await pbOrg.getProject(projectId);

    await prj.editDoneStatus(statusId);

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error updating done status:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { status: 500 },
    );
  }
}
