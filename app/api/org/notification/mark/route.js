import PBNotification from "@/lib/pb/notification";
import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const orgId = formData.get("orgId");
    const notification = formData.get("notification");
    const read = formData.get("read");

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const pbNotification = await PBNotification.get(pbOrg, notification);
    if (read === "true") {
      await pbNotification.markRead();
    } else {
      await pbNotification.markUnread();
    }

    return new Response(null, { status: 200 });
  } catch (e) {
    console.log("ERR", e);
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
