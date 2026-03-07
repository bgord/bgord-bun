import type * as tools from "@bgord/tools";
import type { Languages } from "./languages.vo";
import type { RequestContext } from "./request-context.port";

export interface LanguageDetectorStrategy<T extends tools.LanguageType> {
  detect(context: RequestContext, languages: Languages<T>): T | null;
}
