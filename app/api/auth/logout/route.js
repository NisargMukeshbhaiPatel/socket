import PBAuth from "@/lib/pb/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const nextAccount = PBAuth.logoutCurrent(cookieStore);

    return new Response(JSON.stringify({ nextAccount }), { status: 201 });
  } catch (e) {
    console.trace(e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 400,
    });
  }
}
