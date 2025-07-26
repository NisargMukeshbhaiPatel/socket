import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const avatar = formData.get("avatar");

    const pbUser = await PBUser.get();
    const newUser = await pbUser.update(avatar, name);

    return new Response(JSON.stringify(newUser), { status: 200 });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: prettifyPBError(e.data) || e.message || e.toString(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
