import * as tools from "@bgord/tools";

export type BodyLimitConfig = { maxSize: tools.Size };

export const BodyLimitError = { TooBig: "body.limit.rejected" };

export class BodyLimitMiddleware {
  constructor(private readonly config: BodyLimitConfig) {}

  evaluate(contentLength: tools.IntegerNonNegativeType | undefined): boolean {
    if (contentLength === undefined) return true;

    const size = tools.Size.fromBytes(contentLength);

    if (size.isGreaterThan(this.config.maxSize)) return false;
    return true;
  }
}
