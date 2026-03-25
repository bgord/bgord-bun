import { describe, expect, test } from "bun:test";
import { EventUpcasterRegistryAdapter } from "../src/event-upcaster-registry.adapter";
import type { EventUpcaster } from "../src/event-upcaster-registry.port";
import type * as System from "../src/modules/system";
import * as mocks from "./mocks";

type V2 = Omit<System.Events.HourHasPassedEventType, "version" | "payload"> & {
  version: 2;
  payload: { timestamp: number; timezone: string };
};
type V3 = Omit<System.Events.HourHasPassedEventType, "version" | "payload"> & {
  version: 3;
  payload: { timestamp: number; tz: string };
};

const addTimezone: EventUpcaster<System.Events.HourHasPassedEventType, V2> = {
  name: "HOUR_HAS_PASSED_EVENT",
  fromVersion: 1,
  toVersion: 2,
  upcast(raw) {
    return { ...raw, version: 2, payload: { ...raw.payload, timezone: "UTC" } };
  },
};
const renameTimezone: EventUpcaster<V2, V3> = {
  name: "HOUR_HAS_PASSED_EVENT",
  fromVersion: 2,
  toVersion: 3,
  upcast(raw) {
    const { timezone, ...rest } = raw.payload;
    return { ...raw, version: 3, payload: { ...rest, tz: timezone } };
  },
};

describe("EventUpcasterRegistryAdapter", () => {
  test("no upcaster", () => {
    const registry = new EventUpcasterRegistryAdapter([]);

    expect(registry.upcast(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });

  test("v1 to v2", () => {
    const registry = new EventUpcasterRegistryAdapter([addTimezone]);
    const result = registry.upcast(mocks.GenericHourHasPassedEvent);

    expect(result.version).toEqual(2);
    expect(result.payload["timezone"]).toEqual("UTC");
  });

  test("v1 to v2 to v3", () => {
    const registry = new EventUpcasterRegistryAdapter([addTimezone, renameTimezone]);
    const result = registry.upcast(mocks.GenericHourHasPassedEvent);

    expect(result.version).toEqual(3);
    expect(result.payload["tz"]).toEqual("UTC");
    expect(result.payload["timezone"]).toBeUndefined();
  });

  test("other name", () => {
    const registry = new EventUpcasterRegistryAdapter([addTimezone]);

    expect(registry.upcast(mocks.GenericMinuteHasPassedEvent)).toEqual(mocks.GenericMinuteHasPassedEvent);
  });

  test("no mutation", () => {
    const registry = new EventUpcasterRegistryAdapter([addTimezone]);
    const snapshot = { ...mocks.GenericHourHasPassedEvent };
    registry.upcast(mocks.GenericHourHasPassedEvent);

    expect(mocks.GenericHourHasPassedEvent).toEqual(snapshot);
  });

  test("version regression", () => {
    const upcaster: EventUpcaster<
      System.Events.HourHasPassedEventType,
      System.Events.HourHasPassedEventType
    > = { name: "HOUR_HAS_PASSED_EVENT", fromVersion: 1, toVersion: 1, upcast: (raw) => raw };
    const registry = new EventUpcasterRegistryAdapter([upcaster]);

    expect(() => registry.upcast(mocks.GenericHourHasPassedEvent)).toThrow(
      "event.upcaster.registry.version.regression",
    );
  });
});
