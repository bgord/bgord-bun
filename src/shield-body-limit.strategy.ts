import * as tools from "@bgord/tools";
import type { HasRequestHeader } from "./request-context.port";

export type ShieldBodyLimitConfig = { maxSize: tools.Size };

export const ShieldBodyLimitError = { TooBig: "shield.body.limit.rejected" };

export class ShieldBodyLimitStrategy {
  constructor(private readonly config: ShieldBodyLimitConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = context.request.header("content-length");

    const contentLength = tools.SizeBytes.safeParse(Number(header));

    if (!contentLength.success) return true;

    const size = tools.Size.fromBytes(contentLength.data);

    if (size.isGreaterThan(this.config.maxSize)) return false;
    return true;
  }
}
