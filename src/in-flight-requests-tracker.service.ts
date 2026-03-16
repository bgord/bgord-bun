import * as tools from "@bgord/tools";
import * as v from "valibot";

export class InFlightRequestsTracker {
  private static count: tools.IntegerType = v.parse(tools.Integer, 0);

  static increment(): void {
    InFlightRequestsTracker.count++;
  }

  static decrement(): void {
    InFlightRequestsTracker.count--;
  }

  static get(): tools.IntegerType {
    return InFlightRequestsTracker.count;
  }

  /** @internal */
  static _resetForTest(): void {
    InFlightRequestsTracker.count = v.parse(tools.Integer, 0);
  }
}
