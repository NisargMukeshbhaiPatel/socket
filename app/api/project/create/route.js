import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const {
      orgId,
      name,
      description,
      templateId,
      projectRoles,
      taskStatuses,
      doneTaskIndex,
      extensions,
    } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const prj = await pbOrg.createProject(name, description, templateId);

    const [statuses] = await Promise.all([
      // Task statuses
      Promise.all(
        taskStatuses?.map((task) =>
          prj.createStatus(task.name, task.description),
        ) || [],
      ),
      // Project roles
      Promise.all(
        projectRoles?.map((role) =>
          prj.createRole(role.name, role.isAdmin, role.perms, role.color),
        ) || [],
      ),
      // Extensions
      Promise.all(
        extensions?.map((ext) => prj.addExtension(ext.id, ext.config)) || [],
      ),
    ]);

    if (doneTaskIndex !== -1 && statuses[doneTaskIndex]) {
      await prj.editDoneStatus(statuses[doneTaskIndex].id);
    }

    return new Response(
      JSON.stringify({
        prjId: prj.project.id,
      }),
      { status: 201 },
    );
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
