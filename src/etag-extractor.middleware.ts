import type * as tools from "@bgord/tools";
import type { ETagExtractorStrategy } from "./etag-extractor.strategy";
import type { RequestContext } from "./request-context.port";

export type ETagExtractorMiddlewareConfig = { strategy: ETagExtractorStrategy };

export class ETagExtractorMiddleware {
  constructor(private readonly config: ETagExtractorMiddlewareConfig) {}

  evaluate(context: RequestContext): tools.ETag | null {
    return this.config.strategy.detect(context);
  }
}
