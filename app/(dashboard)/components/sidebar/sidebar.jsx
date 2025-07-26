"use client";
import { useTranslations } from "next-intl";
import { useData } from "../../context";
import OrgNavList from "./org-nav-list";
import ProjectNavList from "./project-nav-list";
import LangPicker from "./language-picker";
import ThemePicker from "./theme-picker";
import UserMenu from "./user-menu";
import {
  SquarePlus,
  LayoutDashboard,
  PanelLeftOpen,
} from "lucide-react";
import Logo from "@/ui/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CREATE_ORG, DASHBOARD } from "@/constants/page-routes";

const ICON_SIZE = 26;

export default function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { projects, user, storedAccounts } = useData();
  const hasProjects = pathname.includes("/org/") && projects.length > 0;

  //Handle overflow-auto for each list
  return (
    <>
      {isMobile && (
        <PanelLeftOpen
          onClick={toggleSidebar}
          className="absolute left-3 top-3"
        />
      )}
      <Sidebar collapsible="icon" customWidth={hasProjects ? "275px" : "14rem"}>
        <SidebarHeader>
          <Logo
            className={`pt-2 transition-opacity ${state !== "collapsed" ? "opacity-100" : "opacity-0"}`}
          />
          <SidebarTrigger className="absolute right-[14px] top-[9px]" />
        </SidebarHeader>
        <SidebarContent className="mt-2 relative overflow-hidden">
          <div className="flex h-full gap-1">
            <div
              className={`pb-8 overflow-auto h-full transition-[width] ${hasProjects ? "hide-scrollbar  w-[48px] " : "w-full"}`}
            >
              <SidebarMenu className="sticky top-0 z-10 bg-sidebar pb-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={t("workspaces")}
                    asChild
                    isActive={pathname === DASHBOARD}
                  >
                    <Link href={DASHBOARD}>
                      <LayoutDashboard size={32} />
                      <span>{t("workspaces")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={t("createOrg")}
                      asChild
                      isActive={pathname === CREATE_ORG}
                    >
                      <Link href={CREATE_ORG}>
                        <SquarePlus />
                        <span>{t("createOrg")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarMenu>
              <SidebarMenu>
                <OrgNavList hasProjects={hasProjects} />
              </SidebarMenu>
            </div>
            <div
              className={`pb-8 overflow-auto transition-[width] transition-opacity pl-2 ${hasProjects && state !== "collapsed" ? "border-l-2 border-accent-foreground w-[220px] opacity-100" : "w-0 opacity-0 hidden"}`}
            >
              <ProjectNavList />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-sidebar to-transparent pointer-events-none" />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <ThemePicker />
            </SidebarMenuItem>

            <SidebarMenuItem>
              <LangPicker />
            </SidebarMenuItem>

            <SidebarMenuItem>
              <UserMenu user={user} storedAccounts={storedAccounts} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
