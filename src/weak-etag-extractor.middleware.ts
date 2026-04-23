import type * as tools from "@bgord/tools";
import type { RequestContext } from "./request-context.port";
import type { WeakETagExtractorStrategy } from "./weak-etag-extractor.strategy";

export type WeakETagExtractorMiddlewareConfig = { strategy: WeakETagExtractorStrategy };

export class WeakETagExtractorMiddleware {
  constructor(private readonly config: WeakETagExtractorMiddlewareConfig) {}

  evaluate(context: RequestContext): tools.WeakETag | null {
    return this.config.strategy.detect(context);
  }
}
