import { describe, expect, test } from "bun:test";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";

describe("EventUpcasterStep", () => {
  test("valid step", () => {
    const step = new EventUpcasterStep({
      name: "ENTRY_DELETED_EVENT",
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, reason: "unknown" }),
    });

    expect(step.config.name).toEqual("ENTRY_DELETED_EVENT");
    expect(step.config.fromVersion).toEqual(1);
    expect(step.config.toVersion).toEqual(2);
  });

  test("upcast", () => {
    type V1 = { entryId: string };
    type V2 = { entryId: string; reason: string };
    const step = new EventUpcasterStep<V1, V2>({
      name: "ENTRY_DELETED_EVENT",
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, reason: "unknown" }),
    });

    expect(step.config.upcast({ entryId: "abc" })).toEqual({ entryId: "abc", reason: "unknown" });
  });

  test("validation - 1 to 3", () => {
    expect(
      () =>
        new EventUpcasterStep({
          name: "ENTRY_DELETED_EVENT",
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
          name: "ENTRY_DELETED_EVENT",
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
          name: "ENTRY_DELETED_EVENT",
          fromVersion: 2,
          toVersion: 1,
          upcast: (payload) => payload,
        }),
    ).toThrow("event.upcaster.step.version.increment");
  });
});
