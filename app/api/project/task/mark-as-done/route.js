import PBUser from "@/lib/pb/user";
import PBTask from "@/lib/pb/task";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, prjId, taskId } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);

    const prj = await pbOrg.getProject(prjId);
    const task = await PBTask.get(prj, taskId);
    const doneId = prj.project.done_status;
    await task.editStatus(doneId);

    return new Response(
      JSON.stringify({
        statusId: doneId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.log(e);
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
