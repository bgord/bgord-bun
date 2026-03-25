import { describe, expect, test } from "bun:test";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";
import type * as System from "../src/modules/system";
import * as mocks from "./mocks";

type HourHasPassedV1 = System.Events.HourHasPassedEventType;
type HourHasPassedV2 = Omit<HourHasPassedV1, "version" | "payload"> & {
  version: 2;
  payload: HourHasPassedV1["payload"] & { source: string };
};

describe("EventUpcasterStep", () => {
  test("valid step", () => {
    const step = new EventUpcasterStep<HourHasPassedV1, HourHasPassedV2>({
      name: "HOUR_HAS_PASSED_EVENT",
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, source: "system" }),
    });

    expect(step.config.name).toEqual("HOUR_HAS_PASSED_EVENT");
    expect(step.config.fromVersion).toEqual(1);
    expect(step.config.toVersion).toEqual(2);
  });

  test("upcast", () => {
    const step = new EventUpcasterStep<HourHasPassedV1, HourHasPassedV2>({
      name: "HOUR_HAS_PASSED_EVENT",
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, source: "system" }),
    });

    expect(step.config.upcast({ timestamp: mocks.TIME_ZERO.ms })).toEqual({
      timestamp: mocks.TIME_ZERO.ms,
      source: "system",
    });
  });

  test("validation - 1 to 3", () => {
    expect(
      () =>
        new EventUpcasterStep({
          name: "HOUR_HAS_PASSED_EVENT",
          fromVersion: 1,
          toVersion: 3,
          upcast: (payload) => payload,
        }),
    ).toThrow("event.upcaster.step.version.increment");
  });

  test("validation - 1 to 1", () => {
    expect(
      () =>
        new EventUpcasterStep({
          name: "HOUR_HAS_PASSED_EVENT",
          fromVersion: 1,
          toVersion: 1,
          upcast: (payload) => payload,
        }),
    ).toThrow("event.upcaster.step.version.increment");
  });

  test("validation - 2 to 1", () => {
    expect(
      () =>
        new EventUpcasterStep({
          name: "HOUR_HAS_PASSED_EVENT",
          fromVersion: 2,
          toVersion: 1,
          upcast: (payload) => payload,
        }),
    ).toThrow("event.upcaster.step.version.increment");
  });
});
