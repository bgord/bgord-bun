import { describe, expect, test } from "bun:test";
import { EventUpcasterChainAdapter } from "../src/event-upcaster-chain.adapter";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";
import type * as System from "../src/modules/system";
import * as mocks from "./mocks";

type HourV1 = System.Events.HourHasPassedEventType;
type HourV2 = Omit<HourV1, "version" | "payload"> & {
  version: 2;
  payload: HourV1["payload"] & { source: string };
};
type HourV3 = Omit<HourV2, "version" | "payload"> & {
  version: 3;
  payload: HourV2["payload"] & { region: string };
};
type HourV4 = Omit<HourV3, "version"> & { version: 4 };

const v1v2 = new EventUpcasterStep<HourV1, HourV2>({
  fromVersion: 1,
  toVersion: 2,
  upcast: (payload) => ({ ...payload, source: "system" }),
});
const v2v3 = new EventUpcasterStep<HourV2, HourV3>({
  fromVersion: 2,
  toVersion: 3,
  upcast: (payload) => ({ ...payload, region: "utc" }),
});

const v2 = {
  ...mocks.GenericHourHasPassedEvent,
  version: 2,
  payload: { ...mocks.GenericHourHasPassedEvent.payload, source: "system" },
};
const v3 = {
  ...mocks.GenericHourHasPassedEvent,
  version: 3,
  payload: { ...mocks.GenericHourHasPassedEvent.payload, source: "system", region: "utc" },
};

describe("EventUpcasterChainAdapter", () => {
  test("no steps", () => {
    const upcaster = new EventUpcasterChainAdapter({});

    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });

  test("unapplicable", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2] });

    expect(upcaster.upcast(mocks.GenericMinuteHasPassedEvent)).toEqual(mocks.GenericMinuteHasPassedEvent);
  });

  test("single step", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2] });

    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(v2);
  });

  test("multi-step chain", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2, v2v3] });

    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(v3);
  });

  test("skips steps below", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2, v2v3] });

    expect(upcaster.upcast(v2)).toEqual(v3);
  });

  test("latest version", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2] });

    expect(upcaster.upcast(v2)).toEqual(v2);
  });

  test("out of order steps", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v2v3, v1v2] });

    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(v3);
  });

  test("version above chain", () => {
    const upcaster = new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2] });
    const v3 = { ...mocks.GenericHourHasPassedEvent, version: 3 };

    expect(upcaster.upcast(v3)).toEqual(v3);
  });

  test("duplicate step", () => {
    expect(() => new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2, v1v2] })).toThrow(
      "event.upcaster.chain.duplicate.step",
    );
  });

  test("gap in chain", () => {
    const v3v4 = new EventUpcasterStep<HourV3, HourV4>({
      fromVersion: 3,
      toVersion: 4,
      upcast: (payload) => payload,
    });

    expect(() => new EventUpcasterChainAdapter({ HOUR_HAS_PASSED_EVENT: [v1v2, v3v4] })).toThrow(
      "event.upcaster.chain.gap",
    );
  });
});
