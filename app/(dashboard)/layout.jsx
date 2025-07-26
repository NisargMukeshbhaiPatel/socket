import PBUser from "@/lib/pb/user";
import PBAuth from "@/lib/pb/auth";
import Sidebar from "./components/sidebar/sidebar";
import { SidebarProvider } from "@/components/sidebar";

import { DataProvider } from "./context";
import { cookies } from "next/headers";

export default async function DashLayout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  const pbUser = await PBUser.get();
  const user = pbUser.getUser();
  const storedAccounts = PBAuth.getStoredAccountsWithData(cookieStore);
  
  const orgs = await Promise.all(
    (await pbUser.getCurrentOrgs()).map(async (org) => {
      return {
        org: org.org,
        roles: await org.getAllRoles(),
      };
    }),
  );

  const invitesData = await pbUser.getInvites();
  const invites = invitesData.map((invite) => {
    return {
      id: invite.id,
      org: invite.expand.org,
      roles: invite.expand.roles,
    };
  });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DataProvider initialData={{ orgs, invites, user, storedAccounts }}>
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 overflow-hidden">
            <main className="flex-1 pb-7 h-full overflow-y-auto pt-14 md:pt-8 px-4 md:px-8">
              <div className="max-w-5xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </DataProvider>
    </SidebarProvider>
  );
}
