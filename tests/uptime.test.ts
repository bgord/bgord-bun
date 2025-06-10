import { describe, expect, spyOn, test } from "bun:test";

import { Uptime } from "../src/uptime.service";

describe("Uptime", () => {
  test("Uptime.get returns seconds and formatted uptime", () => {
    const uptime = 12_000;

    const processUptime = spyOn(process, "uptime").mockImplementation(() => uptime);

    const result = Uptime.get();

    expect(result.seconds).toBe(uptime);
    expect(result.formatted).toBe("about 3 hours ago");

    processUptime.mockRestore();
  });
});
