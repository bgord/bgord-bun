import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export class ClockSystemAdapter implements ClockPort {
  now(): tools.Timestamp {
    // biome-ignore lint: lint/style/noRestrictedGlobals
    return tools.Timestamp.fromNumber(Date.now());
  }
}
