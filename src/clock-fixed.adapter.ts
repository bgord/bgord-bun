import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  private value: tools.Timestamp;

  constructor(candidate: number) {
    this.value = tools.Timestamp.fromNumber(candidate);
  }

  nowMs() {
    return this.value.get();
  }

  now() {
    return this.value;
  }

  advanceBy(duration: tools.Duration): void {
    this.value = this.value.add(duration);
  }
}
