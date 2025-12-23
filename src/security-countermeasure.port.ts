import type { SecurityContext } from "./security-context.types";

export interface SecurityCountermeasurePort {
  execute(context: SecurityContext): Promise<void>;
}
