import { useTranslations } from "next-intl";

export const useDBTranslation = () => {
  const t = useTranslations("Database");

  const tDB = (key) => {
    if (key?.startsWith("$")) {
      return t(key.slice(1));
    }
    return key;
  };

  return tDB;
};
