import * as tools from "@bgord/tools";
import type { JobRecovererPort } from "./job-recoverer.port";

export class JobRecovererNoopAdapter implements JobRecovererPort {
  async recover(): Promise<tools.IntegerNonNegativeType> {
    return tools.Int.nonNegative(0);
  }
}
