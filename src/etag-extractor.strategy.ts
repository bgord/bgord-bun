import type * as tools from "@bgord/tools";
import type { HasRequestHeader, HasRequestParam } from "./request-context.port";

export interface ETagExtractorStrategy {
  detect(context: HasRequestHeader & HasRequestParam): tools.ETag | null;
}
