import type * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";
import type { WeakETagExtractorStrategy } from "./weak-etag-extractor.strategy";

export class WeakETagExtractorFixedStrategy implements WeakETagExtractorStrategy {
  constructor(private readonly value: tools.WeakETag | null) {}

  detect(_context: RequestContext): tools.WeakETag | null {
    return this.value;
  }
}
