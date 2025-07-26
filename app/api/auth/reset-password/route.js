import PBUser from "@/lib/pb/user";

export async function POST() {
  try {
    const pbUser = await PBUser.get();
    await pbUser.sendPasswordResetEmail();
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to send reset email" }), 
      { status: 400 }
    );
  }
}
