import type { Context } from "hono";
import { ALL_BOTS } from "./bots.vo";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleUserAgentAdapter implements SecurityRulePort {
  constructor(private readonly blacklist: string[] = ALL_BOTS) {}

  async isViolated(c: Context) {
    const client = ClientFromHono.translate(c);

    return this.blacklist.some((bot) => client.matchesUa(bot));
  }

  get name() {
    return "user_agent";
  }
}
