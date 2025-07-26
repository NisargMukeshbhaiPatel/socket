import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { getValidLocale } from "./locales";

export default getRequestConfig(async ({ req }) => {
  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get("locale")?.value);

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
