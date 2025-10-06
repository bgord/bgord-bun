import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  private value: tools.TimestampType;

  constructor(candidate: number) {
    this.value = tools.Timestamp.parse(candidate);
  }

  nowMs() {
    return this.value;
  }

  now(): ReturnType<typeof tools.Time.Now> {
    return tools.Time.Now(this.value);
  }

  advanceBy(duration: tools.Duration): void {
    this.value = tools.Time.Now(this.value).Add(duration);
  }
}
