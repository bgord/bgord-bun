import * as v from "valibot";
import { ClientIp, type ClientIpType } from "./client-ip.vo";
import type { HasIdentityRemoteIp } from "./request-context.port";

export type ShieldIpWhitelistConfig = { whitelist: ReadonlyArray<ClientIpType> };

export const ShieldIpWhitelistStrategyError = { Rejected: "shield.ip.whitelist.rejected" };

export class ShieldIpWhitelistStrategy {
  constructor(private readonly config: ShieldIpWhitelistConfig) {}

  evaluate(context: HasIdentityRemoteIp): boolean {
    const ip = v.safeParse(ClientIp, context.identity.remoteIp());

    if (!ip.success) return false;
    return this.config.whitelist.includes(ip.output);
  }
}
