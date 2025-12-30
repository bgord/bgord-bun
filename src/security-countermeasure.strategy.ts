import type * as tools from "@bgord/tools";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasureNameType } from "./security-countermeasure-name.vo";

export type SecurityAction =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; response: { status: ContentfulStatusCode } }
  | { kind: "delay"; duration: tools.Duration; after: SecurityAction }
  | { kind: "mirage"; response: { status: number } };

export interface SecurityCountermeasureStrategy {
  execute(context: SecurityContext): Promise<SecurityAction>;

  get name(): SecurityCountermeasureNameType;
}
