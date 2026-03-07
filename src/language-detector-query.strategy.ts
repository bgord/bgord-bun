import type * as tools from "@bgord/tools";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { Languages } from "./languages.vo";
import type { HasRequestQuery } from "./request-context.port";

export class LanguageDetectorQueryStrategy<T extends tools.LanguageType>
  implements LanguageDetectorStrategy<T>
{
  constructor(private readonly name: string) {}

  detect(context: HasRequestQuery, languages: Languages<T>): T | null {
    const detected = context.request.query()[this.name];

    return languages.isSupported(detected) ? detected : null;
  }
}
