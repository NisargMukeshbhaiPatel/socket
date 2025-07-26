import PBTask from "@/lib/pb/task";
import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, prjId, taskId, changes } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const prj = await pbOrg.getProject(prjId);
    const task = await PBTask.get(prj, taskId);

    if (changes.title != undefined) await task.editTitle(changes.title);
    if (changes.description != undefined) await task.editDescription(changes.description);
    if (changes.status != undefined) await task.editStatus(changes.status);
    if (changes.priority != undefined) await task.editPriority(changes.priority);
    if (changes.dueDate != undefined) await task.editDueDate(changes.dueDate);
    if (changes.assignedTo != undefined) await task.editAssignedTo(changes.assignedTo);
    if (changes.reviewers != undefined) await task.editReviewers(changes.reviewers);

    return new Response(null, { status: 200 });
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
