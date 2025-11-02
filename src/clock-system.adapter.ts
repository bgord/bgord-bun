import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  nowMs() {
    return tools.TimestampValue.parse(Date.now());
  }

  now() {
    return tools.Timestamp.fromNumber(Date.now());
  }
}
