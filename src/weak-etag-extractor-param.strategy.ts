import * as tools from "@bgord/tools";
import type { HasRequestParam } from "./request-context.port";
import type { WeakETagExtractorStrategy } from "./weak-etag-extractor.strategy";

export class WeakETagExtractorParamStrategy implements WeakETagExtractorStrategy {
  constructor(private readonly name: string) {}

  detect(context: HasRequestParam): tools.WeakETag | null {
    try {
      const value = context.request.param(this.name);

      return tools.WeakETag.fromHeader(`W/${value}`);
    } catch {
      return null;
    }
  }
}
