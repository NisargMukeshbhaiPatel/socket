"use client";
import { useData } from "../../context";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { ORG_DASHBOARD } from "@/constants/page-routes";
import { API_ORG_ICON } from "@/constants/api-routes";

export default function OrgNavList({ hasProjects }) {
  const { orgs } = useData();
  const params = useParams();
  if (!orgs || orgs.length === 0) {
    return <></>;
  }
  const orgId = params.orgId;

  return orgs.map(({ org }, i) => (
    <SidebarMenuItem key={org.id}>
      <SidebarMenuButton
        tooltip={org.name}
        alwaysShowTooltip={hasProjects}
        asChild
        isActive={org.id === orgId}
      >
        <Link href={ORG_DASHBOARD(org.id)}>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={org.icon && API_ORG_ICON(org.id)}
              alt={org.name}
            />
            <AvatarFallback className="text-xl rounded-sm">
              {org?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {!hasProjects && <span>{org.name}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
}
