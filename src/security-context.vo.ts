import type { Client } from "./client.vo";
import type { SecurityRuleNameType } from "./security-rule-name.vo";

export class SecurityContext {
  constructor(
    readonly rule: SecurityRuleNameType,
    readonly client: Client,
    readonly userId: string | undefined,
  ) {}
}
