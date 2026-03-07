import type * as tools from "@bgord/tools";
import type { I18nConfig } from "./i18n-config.vo";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { HasRequestQuery } from "./request-context.port";

export class LanguageDetectorQueryStrategy<T extends tools.LanguageType>
  implements LanguageDetectorStrategy<T>
{
  constructor(private readonly name: string) {}

  detect(context: HasRequestQuery, config: I18nConfig<T>): T | null {
    const detected = context.request.query()[this.name];

    return config.isSupported(detected) ? detected : null;
  }
}
