import type { Client } from "./client.vo";
import type { SecurityCountermeasureNameType } from "./security-countermeasure-name.vo";
import type { SecurityRuleNameType } from "./security-rule-name.vo";
import type { UUIDType } from "./uuid.vo";

export class SecurityContext {
  constructor(
    readonly rule: SecurityRuleNameType,
    readonly countermeasure: SecurityCountermeasureNameType,
    readonly client: Client,
    readonly userId: UUIDType | undefined,
  ) {}
}
