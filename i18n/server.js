import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getValidLocale } from "./locales";

export async function getServerTranslation(str) {
  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get("locale")?.value);
  const t = await getTranslations({ locale, namespace: "Database" });
  return (str) => (str?.startsWith("$") ? t(str.slice(1)) : str);
}
