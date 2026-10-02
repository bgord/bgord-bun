import * as tools from "@bgord/tools";
import type { JobRecovererPort } from "./job-recoverer.port";

export class JobRecovererCollectingAdapter implements JobRecovererPort {
  readonly recovered: Array<tools.IntegerNonNegativeType> = [];

  async recover(): Promise<tools.IntegerNonNegativeType> {
    const count = tools.Int.nonNegative(0);

    this.recovered.push(count);

    return count;
  }
}
