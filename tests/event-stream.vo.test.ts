import { describe, expect, test } from "bun:test";

import { EventStream } from "../src/event-stream.vo";

describe("EventStream", () => {
  test("valid EventStreams", () => {
    expect(EventStream.safeParse("journals").success).toBeTruthy();
    expect(EventStream.safeParse("journals_valid").success).toBeTruthy();
  });

  test("throws on invalid values", () => {
    expect(() => EventStream.parse("")).toThrow();
    expect(() => EventStream.parse(1)).toThrow();
  });
});
