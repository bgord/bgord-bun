import * as tools from "@bgord/tools";

export class InFlightRequestsTracker {
  private static count: tools.IntegerType = tools.Int.of(0);

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
    InFlightRequestsTracker.count = tools.Int.of(0);
  }
}
