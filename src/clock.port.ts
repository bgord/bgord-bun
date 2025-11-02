import type * as tools from "@bgord/tools";

export interface ClockPort {
  nowMs(): tools.TimestampValueType;

  now(): tools.Timestamp;
}
