import { describe, expect, test } from "bun:test";
import { EventStream } from "../src/event-stream.vo";

describe("EventStream VO", () => {
  test("happy path", () => {
    expect(EventStream.safeParse("a".repeat(256)).success).toEqual(true);
    expect(EventStream.safeParse("A".repeat(256)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EventStream.parse(null)).toThrow("event.store.type");
  });

  test("rejects non-string - number", () => {
    expect(() => EventStream.parse(253)).toThrow("event.store.type");
  });

  test("rejects empty", () => {
    expect(() => EventStream.parse("")).toThrow("event.stream.empty");
  });

  test("rejects too long", () => {
    expect(() => EventStream.parse(`${"a".repeat(256)}a`)).toThrow("event.stream.too.long");
  });
});
