import PBAuth from "@/lib/pb/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    await PBAuth.register(name, email, password);
    const cookieStore = await cookies();
    await PBAuth.authenticate(cookieStore, email, password);

    return new Response(null, { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 400,
    });
  }
}
