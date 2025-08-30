import type * as tools from "@bgord/tools";

export interface ClockPort {
  now(): tools.TimestampType;
}
