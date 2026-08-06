import type * as tools from "@bgord/tools";
import type { Languages } from "./languages.vo";
import type { HasRequestCookie, HasRequestHeaders, HasRequestQuery } from "./request-context.port";

export interface LanguageDetectorStrategy<T extends tools.LanguageType> {
  detect(context: HasRequestCookie & HasRequestHeaders & HasRequestQuery, languages: Languages<T>): T | null;
}
