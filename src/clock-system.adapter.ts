import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  nowMs() {
    return tools.Timestamp.parse(Date.now());
  }

  now(): ReturnType<typeof tools.Time.Now> {
    return tools.Time.Now(tools.Timestamp.parse(Date.now()));
  }
}
