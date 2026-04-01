import * as v from "valibot";
import { ClientIp, type ClientIpType } from "./client-ip.vo";
import type { HasIdentityIp } from "./request-context.port";

export type ShieldIpBlacklistConfig = { blacklist: ReadonlyArray<ClientIpType> };

export const ShieldIpBlacklistStrategyError = { Rejected: "shield.ip.blacklist.rejected" };

export class ShieldIpBlacklistStrategy {
  constructor(private readonly config: ShieldIpBlacklistConfig) {}

  evaluate(context: HasIdentityIp): boolean {
    const ip = v.safeParse(ClientIp, context.identity.ip());

    if (!ip.success) return false;
    return !this.config.blacklist.includes(ip.output);
  }
}
