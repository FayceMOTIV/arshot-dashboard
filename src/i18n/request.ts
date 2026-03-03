import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import de from "../../messages/de.json";

const messagesMap = { fr, en, es, de } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messagesMap[locale as keyof typeof messagesMap],
  };
});
