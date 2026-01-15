import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { EventLoopLag } from "../src/event-loop-lag.service";

describe("EventLoopLag service", () => {
  test("snapshot - not started", () => {
    expect(() => EventLoopLag.snapshot()).toThrow("event.loop.lag.not.started");
  });

  test("snapshot - happy path", () => {
    EventLoopLag.start();

    const snapshot = EventLoopLag.snapshot();

    expect(snapshot).toHaveProperty("p50");
    expect(snapshot).toHaveProperty("p95");
    expect(snapshot).toHaveProperty("p99");

    expect(snapshot.p50).toBeInstanceOf(tools.Duration);
    expect(snapshot.p95).toBeInstanceOf(tools.Duration);
    expect(snapshot.p99).toBeInstanceOf(tools.Duration);
  });

  test("start is idempotent", () => {
    EventLoopLag.start();
    EventLoopLag.start();
    EventLoopLag.start();
  });
});
