import type * as tools from "@bgord/tools";

export interface JobRecovererPort {
  recover(): Promise<tools.IntegerNonNegativeType>;
}
