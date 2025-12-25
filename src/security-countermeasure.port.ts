import type * as tools from "@bgord/tools";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasureNameType } from "./security-countermeasure-name.vo";

export type SecurityAction =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; response: { status: number } }
  | { kind: "delay"; duration: tools.Duration; after: SecurityAction }
  | { kind: "mirage"; response: { status: number } };

export interface SecurityCountermeasurePort {
  execute(context: SecurityContext): Promise<SecurityAction>;

  get name(): SecurityCountermeasureNameType;
}
