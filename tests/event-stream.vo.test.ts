import { describe, expect, test } from "bun:test";
import { EventStream, EventStreamInvalidError } from "../src/event-stream.vo";

describe("EventStream", () => {
  test("valid EventStreams", () => {
    expect(() => EventStream.parse("journals")).not.toThrow();
    expect(() => EventStream.parse("journals_valid")).not.toThrow();
  });

  test("throws on invalid values", () => {
    expect(() => EventStream.parse("")).toThrow(EventStreamInvalidError.error);
    expect(() => EventStream.parse(1)).toThrow(EventStreamInvalidError.error);
  });
});
