import type { HasRequestForm, HasRequestJson, HasRequestPath } from "./request-context.port";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

export interface SecurityRuleStrategy {
  isViolated(context: HasRequestPath & HasRequestJson & HasRequestForm): Promise<boolean>;

  get name(): SecurityRuleNameType;
}
