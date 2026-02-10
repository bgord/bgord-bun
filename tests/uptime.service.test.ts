import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Uptime } from "../src/uptime.service";

const duration = tools.Duration.Minutes(10);

const Clock = new ClockSystemAdapter();

describe("Uptime service", () => {
  test("happy path", () => {
    using _ = spyOn(process, "uptime").mockImplementation(() => duration.seconds);

    expect(Uptime.get(Clock)).toEqual({ duration, formatted: "10 minutes ago" });
  });
});
