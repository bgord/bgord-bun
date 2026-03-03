import * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";

export class WeakETagExtractorMiddleware {
  evaluate(context: RequestContext): tools.WeakETag | null {
    try {
      const header = context.request.header(tools.WeakETag.IF_MATCH_HEADER_NAME);

      return tools.WeakETag.fromHeader(header);
    } catch {
      return null;
    }
  }
}
