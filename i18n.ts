import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./shared/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  // Utiliser la locale par défaut si la locale n'est pas supportée
  // Au lieu d'appeler notFound() qui n'est pas permis dans le root layout
  const validLocale = locale && locales.includes(locale as Locale) 
    ? (locale as Locale) 
    : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
    timeZone: "Europe/Paris",
    now: new Date(),
  };
});
