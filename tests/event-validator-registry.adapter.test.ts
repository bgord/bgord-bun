import { describe, expect, test } from "bun:test";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type AcceptedEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<AcceptedEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

describe("EventValidatorRegistryAdapter", () => {
  test("names", () => {
    expect(registry.names).toEqual(["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"]);
  });

  test("accepts - true", () => {
    expect(registry.accepts("HOUR_HAS_PASSED_EVENT")).toEqual(true);
    expect(registry.accepts("MINUTE_HAS_PASSED_EVENT")).toEqual(true);
  });

  test("accepts - false", () => {
    expect(registry.accepts("UNKNOWN_EVENT")).toEqual(false);
  });

  test("validate", () => {
    expect(registry.validate(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
    expect(registry.validate(mocks.GenericMinuteHasPassedEvent)).toEqual(mocks.GenericMinuteHasPassedEvent);
  });

  test("validate - missing name", () => {
    expect(() => registry.validate({})).toThrow("event.validator.registry.adapter.error.missing.name");
  });

  test("validate - unknown name", () => {
    expect(() => registry.validate({ name: "UNKNOWN_EVENT" })).toThrow(
      "event.validator.registry.adapter.error.unknown.event",
    );
  });

  test("validate - invalid shape", () => {
    expect(() =>
      registry.validate({ ...mocks.GenericHourHasPassedEvent, payload: { timestamp: "not-a-number" } }),
    ).toThrow("timestamp.invalid");
  });

  test("validate - async schema", () => {
    const asyncSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: () => Promise.resolve({ value: mocks.GenericHourHasPassedEvent }),
      },
    };

    const registry = new EventValidatorRegistryAdapter<AcceptedEvent>({
      [System.Events.HOUR_HAS_PASSED_EVENT]: asyncSchema,
      [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
    });

    expect(() => registry.validate(mocks.GenericHourHasPassedEvent)).toThrow(
      "event.validator.registry.no.async.schema",
    );
  });
});
