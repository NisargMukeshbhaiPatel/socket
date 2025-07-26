"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { SidebarMenuButton } from "@/components/sidebar";
import { Globe } from "lucide-react";
import { locales } from "@/../i18n/locales";

export default function LangPicker() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const handleLanguageChange = (langCode) => {
    document.cookie = `locale=${langCode}; path=/`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="sm">
          <Globe />
          <span>{t("changeLanguage")}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(locales).map((langCode) => (
          <DropdownMenuItem
            key={langCode}
            onClick={() => handleLanguageChange(langCode)}
          >
            {locales[langCode]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
