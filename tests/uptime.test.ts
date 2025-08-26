import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Uptime } from "../src/uptime.service";

describe("Uptime", () => {
  test("Uptime.get returns seconds and formatted uptime", () => {
    const uptime = tools.Timestamp.parse(12_000);

    spyOn(process, "uptime").mockImplementation(() => uptime);

    const result = Uptime.get();

    expect(result.seconds).toBe(uptime);
    expect(result.formatted).toBe("about 3 hours ago");
  });
});
