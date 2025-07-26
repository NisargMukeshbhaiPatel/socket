import PBUser from "@/lib/pb/user";
import PBOrg from "@/lib/pb/org";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  const pbUser = await PBUser.get();
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const icon_file = formData.get("icon_file");
    const description = formData.get("description");
    const org_template = formData.get("org_template");
    const roles = JSON.parse(formData.get("roles") || "[]");

    const pbOrg = await PBOrg.create(
      pbUser,
      name,
      icon_file,
      description,
      org_template,
    );

    for (const role of roles) {
      const { name, isAdmin, perms, color } = role;
      await pbOrg.createRole(name, isAdmin, perms, color);
    }

    // Handle extensions from form data
    const extensions = JSON.parse(formData.get("extensions")) || [];
    for (const ext of extensions) {
      await pbOrg.addExtension(ext.id, ext.config);
    }

    return new Response(
      JSON.stringify({
        orgId: pbOrg.id,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.trace(e);
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
