import type { SecurityContext } from "./security-context.vo";

export interface SecurityCountermeasurePort {
  execute(context: SecurityContext): Promise<void>;
}
