import type { Context } from "hono";
import type { SecurityRulePort } from "./security-rule.port";

export class SecurityRuleHoneyPotFieldAdapter implements SecurityRulePort {
  constructor(private readonly field: string) {}

  async check(c: Context) {
    const request = c.req.raw.clone();

    const body = await request.json().catch(() => ({}));
    const value = body[this.field];

    return value !== undefined && value !== null && value !== "";
  }

  get name() {
    return "honey_pot_field";
  }
}
