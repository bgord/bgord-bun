import { expect, spyOn, test } from "bun:test";
import { Uptime } from "../src/uptime";

test("Uptime.get returns seconds and formatted uptime", () => {
  const mockUptimeSeconds = 12_000;

  const uptimeSpy = spyOn(process, "uptime").mockImplementation(() => mockUptimeSeconds);

  const result = Uptime.get();

  expect(result.seconds).toBe(mockUptimeSeconds);
  expect(result.formatted).toBe("about 3 hours ago");

  uptimeSpy.mockRestore();
});
