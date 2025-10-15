import { describe, expect, test } from "bun:test";
import { EventStream, EventStreamError } from "../src/event-stream.vo";

describe("EventStream VO", () => {
  test("happy path", () => {
    expect(EventStream.safeParse("a".repeat(256)).success).toEqual(true);
    expect(EventStream.safeParse("A".repeat(256)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EventStream.parse(null)).toThrow(EventStreamError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EventStream.parse(253)).toThrow(EventStreamError.Type);
  });

  test("rejects empty", () => {
    expect(() => EventStream.parse("")).toThrow(EventStreamError.Empty);
  });

  test("rejects too long", () => {
    expect(() => EventStream.parse(`${"a".repeat(256)}a`)).toThrow(EventStreamError.TooLong);
  });
});
