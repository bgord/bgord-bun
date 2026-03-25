import * as v from "valibot";
import { ClientIp, type ClientIpType } from "./client-ip.vo";
import type { HasIdentityIp } from "./request-context.port";

export type ShieldIpWhitelistConfig = { whitelist: Array<ClientIpType> };

export const ShieldIpWhitelistStrategyError = { Rejected: "shield.ip.whitelist.rejected" };

export class ShieldIpWhitelistStrategy {
  constructor(private readonly config: ShieldIpWhitelistConfig) {}

  evaluate(context: HasIdentityIp): boolean {
    const ip = v.safeParse(ClientIp, context.identity.ip());

    // Stryker disable all
    if (!ip.success) return false;
    // Stryker restore all
    return this.config.whitelist.includes(ip.output);
  }
}
