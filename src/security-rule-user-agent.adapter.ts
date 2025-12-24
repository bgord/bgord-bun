import type { Context } from "hono";
import { ALL_BOTS } from "./bots.vo";
import { Client } from "./client.vo";
import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleUserAgentAdapter implements SecurityRulePort {
  constructor(private readonly blacklist: string[] = ALL_BOTS) {}

  async isViolated(c: Context) {
    const client = Client.fromHonoContext(c);

    return this.blacklist.some((bot) => client.matchesUa(bot));
  }

  get name() {
    return "user_agent";
  }
}
