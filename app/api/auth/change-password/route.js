import { globalPB } from "@/lib/pb/global";
import PBUser from "@/lib/pb/user";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();
    const pb = globalPB;
    await PBUser.changePassword(pb, token, newPassword);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to change password" }), 
      { status: 400 }
    );
  }
}
