import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  nowMs() {
    return tools.Timestamp.fromNumber(Date.now()).get();
  }

  now() {
    return tools.Timestamp.fromNumber(Date.now());
  }
}
