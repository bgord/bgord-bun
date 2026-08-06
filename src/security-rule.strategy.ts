import type { HasRequestJson, HasRequestPath } from "./request-context.port";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

export interface SecurityRuleStrategy {
  isViolated(context: HasRequestPath & HasRequestJson): Promise<boolean>;

  get name(): SecurityRuleNameType;
}
