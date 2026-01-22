import type { HasRequestJSON, HasRequestPath } from "./request-context.port";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

type RequestContextCapabilities = HasRequestPath & HasRequestJSON;

export interface SecurityRuleStrategy {
  isViolated(context: RequestContextCapabilities): Promise<boolean>;

  get name(): SecurityRuleNameType;
}
