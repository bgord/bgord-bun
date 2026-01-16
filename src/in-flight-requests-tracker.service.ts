import type * as tools from "@bgord/tools";

export class InFlightRequestsTracker {
  private static count = 0 as tools.IntegerType;

  static increment(): void {
    InFlightRequestsTracker.count++;
  }

  static decrement(): void {
    InFlightRequestsTracker.count--;
  }

  static get(): number {
    return InFlightRequestsTracker.count;
  }

  /** @internal */
  static _resetForTest(): void {
    InFlightRequestsTracker.count = 0 as tools.IntegerType;
  }
}
