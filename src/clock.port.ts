import type * as tools from "@bgord/tools";

export interface ClockPort {
  nowMs(): tools.TimestampType;

  now(): ReturnType<typeof tools.Time.Now>;
}
