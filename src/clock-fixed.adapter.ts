import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockFixedAdapter implements ClockPort {
  constructor(private readonly value: number) {}

  now() {
    return tools.Timestamp.parse(this.value);
  }
}
