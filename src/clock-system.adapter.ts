import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  now() {
    return tools.Timestamp.parse(Date.now());
  }
}
