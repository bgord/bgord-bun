import type * as tools from "@bgord/tools";
import type { ETagExtractorStrategy } from "./etag-extractor.strategy";
import type { RequestContext } from "./request-context.port";

export class ETagExtractorFixedStrategy implements ETagExtractorStrategy {
  constructor(private readonly value: tools.ETag | null) {}

  detect(_context: RequestContext): tools.ETag | null {
    return this.value;
  }
}
