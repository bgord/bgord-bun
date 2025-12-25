import type { Context } from "hono";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

export interface SecurityRulePort {
  isViolated(c: Context): Promise<boolean>;

  get name(): SecurityRuleNameType;
}
