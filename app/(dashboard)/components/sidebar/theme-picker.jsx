"use client";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/sidebar";
import { Sun, Moon } from "lucide-react";

export default function ThemePicker() {
  const t = useTranslations("Dashboard");
  const { theme, setTheme } = useTheme();
  const toggleLightDark = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <SidebarMenuButton size="sm" onClick={toggleLightDark}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span>{t("toggleTheme")}</span>
    </SidebarMenuButton>
  );
}
