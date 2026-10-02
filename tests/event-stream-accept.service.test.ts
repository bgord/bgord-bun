import { describe, expect, test } from "bun:test";
import { EventStreamAccept } from "../src/event-stream-accept.service";

describe("EventStreamAccept", () => {
  test("matches", () => {
    expect(EventStreamAccept.matches("text/event-stream")).toEqual(true);
  });

  test("matches - uppercase", () => {
    expect(EventStreamAccept.matches("TEXT/EVENT-STREAM")).toEqual(true);
  });

  test("matches - parameters", () => {
    expect(EventStreamAccept.matches("text/event-stream;charset=utf-8")).toEqual(true);
  });

  test("matches - multi-value list", () => {
    expect(EventStreamAccept.matches("application/json, text/event-stream")).toEqual(true);
  });

  test("matches - multi-value list with parameters", () => {
    expect(EventStreamAccept.matches("application/json, text/event-stream ;q=0.9")).toEqual(true);
  });

  test("matches - undefined", () => {
    expect(EventStreamAccept.matches(undefined)).toEqual(false);
  });

  test("matches - empty", () => {
    expect(EventStreamAccept.matches("")).toEqual(false);
  });

  test("matches - other type", () => {
    expect(EventStreamAccept.matches("application/json")).toEqual(false);
  });

  test("matches - prefix only", () => {
    expect(EventStreamAccept.matches("text/event-stream-v2")).toEqual(false);
  });
});
