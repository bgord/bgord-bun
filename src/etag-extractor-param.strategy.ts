import * as tools from "@bgord/tools";
import type { ETagExtractorStrategy } from "./etag-extractor.strategy";
import type { HasRequestParam } from "./request-context.port";

export class ETagExtractorParamStrategy implements ETagExtractorStrategy {
  constructor(private readonly name: string) {}

  detect(context: HasRequestParam): tools.ETag | null {
    try {
      const value = context.request.param(this.name);

      return tools.ETag.fromHeader(value);
    } catch {
      return null;
    }
  }
}
