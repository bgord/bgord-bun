import type * as tools from "@bgord/tools";

export type ShieldTimeoutConfig = { duration: tools.Duration };

export const ShieldTimeoutStrategyError = { Rejected: "shield.timeout.rejected" };

export class ShieldTimeoutStrategy {
  constructor(readonly config: ShieldTimeoutConfig) {}
}
