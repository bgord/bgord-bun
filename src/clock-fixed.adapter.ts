import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  private value: tools.TimestampType;

  constructor(candidate: number) {
    this.value = tools.Timestamp.parse(candidate);
  }

  nowMs() {
    return tools.Timestamp.parse(this.value);
  }

  now(): ReturnType<typeof tools.Time.Now> {
    return tools.Time.Now(this.value);
  }

  advanceBy(time: tools.TimeResult): void {
    this.value = tools.Timestamp.parse(this.value + time.ms);
  }
}
