import type * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";

export interface ETagExtractorStrategy {
  detect(context: RequestContext): tools.ETag | null;
}
