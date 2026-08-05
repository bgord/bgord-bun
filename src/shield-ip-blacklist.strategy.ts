import * as v from "valibot";
import { ClientIp, type ClientIpType } from "./client-ip.vo";
import type { HasIdentityRemoteIp } from "./request-context.port";

export type ShieldIpBlacklistConfig = { blacklist: ReadonlyArray<ClientIpType> };

export const ShieldIpBlacklistStrategyError = { Rejected: "shield.ip.blacklist.rejected" };

export class ShieldIpBlacklistStrategy {
  constructor(private readonly config: ShieldIpBlacklistConfig) {}

  evaluate(context: HasIdentityRemoteIp): boolean {
    const ip = v.safeParse(ClientIp, context.identity.remoteIp());

    if (!ip.success) return true;
    return !this.config.blacklist.includes(ip.output);
  }
}
