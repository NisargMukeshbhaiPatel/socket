// Define supported languages
export const locales = {
  en: "English",
  fr: "Français",
};

// Define the default locale
export const defaultLocale = "en";


export const getValidLocale = (locale) => {
  return locales[locale] ? locale : defaultLocale;
};

