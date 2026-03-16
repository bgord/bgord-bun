import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { EventStream } from "../src/event-stream.vo";

describe("EventStream", () => {
  test("happy path", () => {
    expect(v.safeParse(EventStream, "a".repeat(256)).success).toEqual(true);
    expect(v.safeParse(EventStream, "A".repeat(256)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(EventStream, null)).toThrow("event.store.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(EventStream, 253)).toThrow("event.store.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(EventStream, "")).toThrow("event.stream.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(EventStream, `${"a".repeat(256)}a`)).toThrow("event.stream.too.long");
  });
});
