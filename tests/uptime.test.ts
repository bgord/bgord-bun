import { describe, expect, spyOn, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Uptime } from "../src/uptime.service";

const clock = new ClockSystemAdapter();

describe("Uptime", () => {
  test("Uptime.get returns seconds and formatted uptime", () => {
    spyOn(process, "uptime").mockImplementation(() => 12_000);

    const result = Uptime.get(clock);

    expect(result.duration.hours).toEqual(3.33);
    expect(result.formatted).toEqual("about 3 hours ago");
  });
});
