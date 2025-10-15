import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Uptime } from "../src/uptime.service";

const clock = new ClockSystemAdapter();
const duration = tools.Duration.Minutes(10);

describe("Uptime service", () => {
  test("happy path", () => {
    spyOn(process, "uptime").mockImplementation(() => duration.seconds);

    expect(Uptime.get(clock)).toEqual({ duration, formatted: "10 minutes ago" });
  });
});
