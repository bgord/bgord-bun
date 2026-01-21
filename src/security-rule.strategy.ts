import type { RequestContext } from "./request-context.port";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

export interface SecurityRuleStrategy {
  isViolated(context: RequestContext): Promise<boolean>;

  get name(): SecurityRuleNameType;
}
