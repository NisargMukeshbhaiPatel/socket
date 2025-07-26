import PBUser from "@/lib/pb/user";

export async function POST(request) {
  try {
    const pbUser = await PBUser.get();
    const { orgId, inviteId, accepted } = await request.json();
    const pbOrg = await pbUser.getOrg(orgId);

    await pbOrg.acceptProjectInvite(inviteId, accepted);

    return new Response(null, { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 400,
    });
  }
}
