"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarMenuButton } from "@/components/sidebar";
import { LogOut } from "lucide-react";
import {LOGIN} from "@/constants/page-routes"

export default function ThemePicker() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const logout = () => {
    document.cookie = "pb_auth=; path=/; Max-Age=0;";
    router.push(LOGIN);
  };
  return (
    <SidebarMenuButton size="sm" onClick={logout}>
      <LogOut />
      <span>{t("logout")}</span>
    </SidebarMenuButton>
  );
}
