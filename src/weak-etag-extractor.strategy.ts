import type * as tools from "@bgord/tools";
import type { HasRequestHeader, HasRequestParam } from "./request-context.port";

export interface WeakETagExtractorStrategy {
  detect(context: HasRequestHeader & HasRequestParam): tools.WeakETag | null;
}
