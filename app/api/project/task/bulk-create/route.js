import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, prjId, tasks } = await request.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Tasks must be a non-empty array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    // Validate each task has required fields
    const invalidTasks = tasks.filter((task) => !task.title);
    if (invalidTasks.length > 0) {
      return new Response(
        JSON.stringify({
          error: "All tasks must have a title",
          invalidTasks,
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

    // Create all tasks
    const results = await Promise.all(
      tasks.map((task) =>
        pbProject
          .createTask(
            task.title,
            task.description,
            task.dueDate || null,
            task.priority,
            task.status,
            task.assignedToProjectMemberIds || [],
            task.reviewersProjectMemberIds || [],
          )
          .catch((error) => ({
            task,
            error:
              prettifyPBError(error.data) || error.message || error.toString(),
          })),
      ),
    );

    // Check if any tasks failed to create
    const failures = results.filter((result) => "error" in result);

    if (failures.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Some tasks failed to create",
        }),
        {
          status: 207,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(null, {
      status: 201,
    });
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
