import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  constructor(private value: tools.Timestamp) {}

  now() {
    return this.value;
  }

  advanceBy(duration: tools.Duration): void {
    this.value = this.value.add(duration);
  }
}
