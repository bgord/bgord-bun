import type * as tools from "@bgord/tools";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { Languages } from "./languages.vo";
import type { HasRequestHeaders } from "./request-context.port";

export class LanguageDetectorHeaderStrategy<T extends tools.LanguageType>
  implements LanguageDetectorStrategy<T>
{
  detect(context: HasRequestHeaders, languages: Languages<T>): T | null {
    const header = context.request.headers().get("Accept-Language");
    if (!header) return null;

    const incoming = header
      .split(",")
      .map((language) => language.split(";")[0]?.trim().toLowerCase().split("-")[0]);

    return incoming.find((language) => languages.isSupported(language)) ?? null;
  }
}
