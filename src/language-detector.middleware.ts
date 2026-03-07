import type * as tools from "@bgord/tools";
import type { I18nConfig } from "./i18n-config.vo";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { RequestContext } from "./request-context.port";

export type LanguageDetectorMiddlewareConfig<T extends tools.LanguageType> = {
  i18n: I18nConfig<T>;
  strategies: Array<LanguageDetectorStrategy<T>>;
};

export class LanguageDetectorMiddleware<T extends tools.LanguageType> {
  constructor(private readonly config: LanguageDetectorMiddlewareConfig<T>) {}

  evaluate(context: RequestContext): T {
    for (const strategy of this.config.strategies) {
      const detected = strategy.detect(context, this.config.i18n);
      if (detected !== null) return detected;
    }

    return this.config.i18n.fallback;
  }
}
