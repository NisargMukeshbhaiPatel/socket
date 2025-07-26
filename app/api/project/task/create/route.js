import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const {
      orgId,
      prjId,
      title,
      description,
      dueDate,
      priority,
      status,
      assignedToProjectMemberIds,
      reviewersProjectMemberIds,
    } = await request.json();

    if (!title) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbProject = await pbOrg.getProject(prjId);

    await pbProject.createTask(
      title,
      description,
      dueDate || null,
      priority,
      status,
      assignedToProjectMemberIds || [],
      reviewersProjectMemberIds || [],
    );

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
