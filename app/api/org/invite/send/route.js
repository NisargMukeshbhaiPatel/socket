import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const { orgId, emails, roleIds } = await request.json();
    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);

    // Invite each email with the provided roles
    await Promise.all(emails.map((email) => pbOrg.invite(email, roleIds)));

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
