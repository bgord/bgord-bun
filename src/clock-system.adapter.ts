import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  nowMs() {
    return tools.TimestampVO.fromNumber(Date.now()).ms;
  }

  now() {
    return tools.TimestampVO.fromNumber(Date.now());
  }
}
