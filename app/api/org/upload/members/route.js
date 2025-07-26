import PBUser from "@/lib/pb/user";
import { orgMemberImporter } from "@/lib/pb/importer";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const orgId = formData.get("orgId");
    const mapping = JSON.parse(formData.get("mapping"));

    if (!file.name.endsWith(".csv")) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid file type. Please upload CSV or Export your excel sheet to csv.",
        }),
        { status: 400 },
      );
    }
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    await orgMemberImporter(pbOrg, file);

    return new Response(null, { status: 201 });
  } catch (error) {
    console.error("Org members Upload error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process CSV upload",
      }),
      { status: 500 },
    );
  }
}
