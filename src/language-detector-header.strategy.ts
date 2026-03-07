import type * as tools from "@bgord/tools";
import type { I18nConfig } from "./i18n-config.vo";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { HasRequestHeaders } from "./request-context.port";

export class LanguageDetectorHeaderStrategy<T extends tools.LanguageType>
  implements LanguageDetectorStrategy<T>
{
  detect(context: HasRequestHeaders, i18n: I18nConfig<T>): T | null {
    const header = context.request.headers().get("Accept-Language");
    if (!header) return null;

    const languages = header
      .split(",")
      .map((language) => language.split(";")[0]?.trim().toLowerCase().split("-")[0]);

    return languages.find((lang) => i18n.isSupported(lang)) ?? null;
  }
}
