"use client";
import { useParams } from "next/navigation";
import { useData } from "../../context";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Folder } from "lucide-react";
import { PRJ_DASHBOARD, ORG_DASHBOARD } from "@/constants/page-routes";
import { API_ORG_ICON } from "@/constants/api-routes";

export default function ProjectNavList() {
  const { getOrgData, projects } = useData();
  const params = useParams();
  const orgId = params.orgId;
  const org = getOrgData(orgId);
  const prjId = params.prjId;

  return (
    <SidebarMenu>
      <div className="pb-2 pt-[3px] sticky top-0 z-10 bg-sidebar">
        <Link
          href={ORG_DASHBOARD(orgId)}
          className="flex items-center space-x-2"
        >
          <Avatar className="h-10 w-10">
            {org.icon ? (
              <AvatarImage src={API_ORG_ICON(org.id)} alt={org.name} />
            ) : (
              <AvatarImage src={null} alt={org.name} />
            )}
            <AvatarFallback className="text-xl rounded-sm">
              {org?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold text-sidebar-foreground truncate">
            {org.name}
          </p>
        </Link>
        <h3 className="mt-4 text-md text-sidebar-foreground/60">Projects</h3>
      </div>

      {projects.map((project) => (
        <SidebarMenuItem key={project.id}>
          <SidebarMenuButton asChild isActive={project.id === prjId}>
            <Link
              href={PRJ_DASHBOARD(orgId, project.id)}
              className="flex items-center gap-1"
            >
              <Folder className="text-blue-500" style={{ width: "18px" }} />
              <span className="truncate">{project.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
