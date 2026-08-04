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

    // Example Accept-Language header: en-US,en;q=0.9,pl;q=0.8
    const incoming = header
      .split(",")
      .map((part) => {
        const [tag = "", quality = "q=1"] = part.split(";");

        return {
          language: tag.trim().toLowerCase().split("-")[0],
          quality: Number(quality.trim().replace("q=", "")),
        };
      })
      // Quality of 0 means the language is explicitly not acceptable
      .filter((candidate) => candidate.quality > 0)
      .sort((first, second) => second.quality - first.quality)
      .map((candidate) => candidate.language);

    return incoming.find((language) => languages.isSupported(language)) ?? null;
  }
}
