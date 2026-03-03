import * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";

export class ETagExtractorMiddleware {
  evaluate(context: RequestContext): tools.ETag | null {
    try {
      const header = context.request.header(tools.ETag.IF_MATCH_HEADER_NAME);

      return tools.ETag.fromHeader(header);
    } catch {
      return null;
    }
  }
}
