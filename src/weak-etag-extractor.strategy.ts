import type * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";

export interface WeakETagExtractorStrategy {
  detect(context: RequestContext): tools.WeakETag | null;
}
