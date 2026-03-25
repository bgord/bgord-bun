import { describe, expect, test } from "bun:test";
import { EventUpcasterChainAdapter } from "../src/event-upcaster-chain.adapter";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";
import * as mocks from "./mocks";

const v1v2 = new EventUpcasterStep({
  name: "HOUR_HAS_PASSED_EVENT",
  fromVersion: 1,
  toVersion: 2,
  upcast: (payload) => ({ ...payload, source: "system" }),
});

const v2ToV3 = new EventUpcasterStep({
  name: "HOUR_HAS_PASSED_EVENT",
  fromVersion: 2,
  toVersion: 3,
  upcast: (payload) => ({ ...payload, region: "utc" }),
});

describe("EventUpcasterChainAdapter", () => {
  test("no steps", () => {
    const upcaster = new EventUpcasterChainAdapter([]);

    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });

  test("unknown event - passthrough", () => {
    const upcaster = new EventUpcasterChainAdapter([v1v2]);

    expect(upcaster.upcast(mocks.GenericMinuteHasPassedEvent)).toEqual(mocks.GenericMinuteHasPassedEvent);
  });

  test("single step", () => {
    const upcaster = new EventUpcasterChainAdapter([v1v2]);
    const result = upcaster.upcast(mocks.GenericHourHasPassedEvent);

    expect(result.version).toEqual(2);
    expect(result.payload).toEqual({ ...mocks.GenericHourHasPassedEvent.payload, source: "system" });
  });

  test("multi-step chain", () => {
    const upcaster = new EventUpcasterChainAdapter([v1v2, v2ToV3]);
    const result = upcaster.upcast(mocks.GenericHourHasPassedEvent);

    expect(result.version).toEqual(3);
    expect(result.payload).toEqual({
      ...mocks.GenericHourHasPassedEvent.payload,
      source: "system",
      region: "utc",
    });
  });

  test("skips steps below event version", () => {
    const upcaster = new EventUpcasterChainAdapter([v1v2, v2ToV3]);
    const v2Event = {
      ...mocks.GenericHourHasPassedEvent,
      version: 2,
      payload: { timestamp: 0, source: "system" },
    };
    const result = upcaster.upcast(v2Event);

    expect(result.version).toEqual(3);
    expect(result.payload).toEqual({ timestamp: 0, source: "system", region: "utc" });
  });

  test("event already at latest version", () => {
    const upcaster = new EventUpcasterChainAdapter([v1v2]);
    const v2Event = {
      ...mocks.GenericHourHasPassedEvent,
      version: 2,
      payload: { timestamp: 0, source: "system" },
    };

    expect(upcaster.upcast(v2Event)).toEqual(v2Event);
  });

  test("steps for different event names", () => {
    const minuteStep = new EventUpcasterStep({
      name: "MINUTE_HAS_PASSED_EVENT",
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, precision: "ms" }),
    });

    const upcaster = new EventUpcasterChainAdapter([v1v2, minuteStep]);

    const hourResult = upcaster.upcast(mocks.GenericHourHasPassedEvent);
    expect(hourResult.version).toEqual(2);
    expect(hourResult.payload).toEqual({ ...mocks.GenericHourHasPassedEvent.payload, source: "system" });

    const minuteResult = upcaster.upcast(mocks.GenericMinuteHasPassedEvent);
    expect(minuteResult.version).toEqual(2);
    expect(minuteResult.payload).toEqual({ ...mocks.GenericMinuteHasPassedEvent.payload, precision: "ms" });
  });

  test("steps passed out of order", () => {
    const upcaster = new EventUpcasterChainAdapter([v2ToV3, v1v2]);
    const result = upcaster.upcast(mocks.GenericHourHasPassedEvent);

    expect(result.version).toEqual(3);
    expect(result.payload).toEqual({
      ...mocks.GenericHourHasPassedEvent.payload,
      source: "system",
      region: "utc",
    });
  });

  test("duplicate step", () => {
    expect(() => new EventUpcasterChainAdapter([v1v2, v1v2])).toThrow("event.upcaster.chain.duplicate.step");
  });

  test("gap in chain", () => {
    const v3ToV4 = new EventUpcasterStep({
      name: "HOUR_HAS_PASSED_EVENT",
      fromVersion: 3,
      toVersion: 4,
      upcast: (payload) => payload,
    });

    expect(() => new EventUpcasterChainAdapter([v1v2, v3ToV4])).toThrow("event.upcaster.chain.gap");
  });
});
