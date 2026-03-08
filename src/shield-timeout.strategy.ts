import type * as tools from "@bgord/tools";

export const ShieldTimeoutStrategyError = { Rejected: "shield.timeout.rejected" };

export class ShieldTimeoutStrategy {
  constructor(readonly config: tools.Duration) {}
}
