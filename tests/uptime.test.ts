import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Uptime } from "../src/uptime.service";

const clock = new ClockSystemAdapter();

describe("Uptime", () => {
  test("Uptime.get returns seconds and formatted uptime", () => {
    const uptime = tools.Timestamp.parse(12_000);
    spyOn(process, "uptime").mockImplementation(() => uptime);

    const result = Uptime.get(clock);

    expect(result.seconds).toBe(uptime);
    expect(result.formatted).toBe("about 3 hours ago");
  });
});
