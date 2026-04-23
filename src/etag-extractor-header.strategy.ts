import * as tools from "@bgord/tools";
import type { ETagExtractorStrategy } from "./etag-extractor.strategy";
import type { HasRequestHeader } from "./request-context.port";

export class ETagExtractorHeaderStrategy implements ETagExtractorStrategy {
  detect(context: HasRequestHeader): tools.ETag | null {
    try {
      const header = context.request.header(tools.ETag.IF_MATCH_HEADER_NAME);

      return tools.ETag.fromHeader(header);
    } catch {
      return null;
    }
  }
}
