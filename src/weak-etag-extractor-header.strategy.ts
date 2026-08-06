import * as tools from "@bgord/tools";
import type { HasRequestHeader } from "./request-context.port";
import type { WeakETagExtractorStrategy } from "./weak-etag-extractor.strategy";

export class WeakETagExtractorHeaderStrategy implements WeakETagExtractorStrategy {
  private static readonly PREFIX = "W/";

  detect(context: HasRequestHeader): tools.WeakETag | null {
    try {
      const header = context.request.header(tools.WeakETag.IF_MATCH_HEADER_NAME);

      if (!header?.replace(WeakETagExtractorHeaderStrategy.PREFIX, "").trim()) return null;

      return tools.WeakETag.fromHeader(header);
    } catch {
      return null;
    }
  }
}
