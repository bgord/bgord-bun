import type { Context } from "hono";

export interface SecurityRulePort {
  isViolated(c: Context): Promise<boolean>;

  get name(): string;
}
