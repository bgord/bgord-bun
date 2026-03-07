import type * as tools from "@bgord/tools";
import type { I18nConfig } from "./i18n-config.vo";
import type { RequestContext } from "./request-context.port";

export interface LanguageDetectorStrategy<T extends tools.LanguageType> {
  detect(context: RequestContext, config: I18nConfig<T>): T | null;
}
