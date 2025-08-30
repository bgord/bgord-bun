import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  constructor(private readonly value: number) {}

  nowMs() {
    return tools.Timestamp.parse(this.value);
  }

  now(): ReturnType<typeof tools.Time.Now> {
    return tools.Time.Now(this.value);
  }
}
