import type * as tools from "@bgord/tools";
import type { SecurityContext } from "./security-context.vo";

export type SecurityAction =
  | { kind: "allow" }
  | {
      kind: "deny";
      reason: string;
      response?: { status: number };
    }
  | {
      kind: "delay";
      duration: tools.Duration;
      then: SecurityAction;
    }
  | {
      kind: "mirage";
      response: { status: number };
    };

export interface SecurityCountermeasurePort {
  execute(context: SecurityContext): Promise<SecurityAction>;
}
