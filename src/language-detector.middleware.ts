import type * as tools from "@bgord/tools";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { Languages } from "./languages.vo";
import type { RequestContext } from "./request-context.port";

export type LanguageDetectorMiddlewareConfig<T extends tools.LanguageType> = {
  languages: Languages<T>;
  strategies: Array<LanguageDetectorStrategy<T>>;
};

export class LanguageDetectorMiddleware<T extends tools.LanguageType> {
  constructor(private readonly config: LanguageDetectorMiddlewareConfig<T>) {}

  evaluate(context: RequestContext): T {
    for (const strategy of this.config.strategies) {
      const detected = strategy.detect(context, this.config.languages);
      if (detected !== null) return detected;
    }

    return this.config.languages.fallback;
  }
}
