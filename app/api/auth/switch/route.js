import PBAuth from "@/lib/pb/auth";
import { cookies } from "next/headers";

export async function POST(request) {
	try {
		const { userId } = await request.json();
		const cookieStore = await cookies();
		const nextAccount = PBAuth.switchAccount(cookieStore, userId);
		return new Response(JSON.stringify({ nextAccount }), { status: 201 });
	} catch (e) {
		console.trace(e);
		return new Response(JSON.stringify({ error: e.message || e.toString() }), {
			status: 400,
		});
	}
}
