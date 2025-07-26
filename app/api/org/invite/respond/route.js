import PBUser from "@/lib/pb/user";

export async function POST(request) {
  const pbUser = await PBUser.get();

  try {
    const { inviteId, accepted } = await request.json();
    await pbUser.acceptInvite(inviteId, accepted);

    return new Response(null, { status: 201 });
  } catch (e) {
    console.trace(e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 400,
    });
  }
}
