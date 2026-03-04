import * as tools from "@bgord/tools";

export type ShieldBodyLimitConfig = { maxSize: tools.Size };

export const ShieldBodyLimitError = { TooBig: "shield.body.limit.rejected" };

export class ShieldBodyLimitStrategy {
  constructor(private readonly config: ShieldBodyLimitConfig) {}

  evaluate(contentLength: tools.IntegerNonNegativeType | undefined): boolean {
    if (contentLength === undefined) return true;

    const size = tools.Size.fromBytes(contentLength);

    if (size.isGreaterThan(this.config.maxSize)) return false;
    return true;
  }
}
