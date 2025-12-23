import type { Context } from "hono";

export interface SecurityRulePort {
  check(c: Context): Promise<boolean>;

  get name(): string;
}
