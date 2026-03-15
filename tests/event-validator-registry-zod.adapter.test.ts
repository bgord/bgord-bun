import { describe, expect, test } from "bun:test";
import { EventValidatorRegistryZodAdapter } from "../src/event-validator-registry-zod.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

const registry = new EventValidatorRegistryZodAdapter<System.Events.HourHasPassedEventType>([
  System.Events.HourHasPassedEvent,
]);

describe("EventValidatorRegistryZodAdapter", () => {
  test("names", () => {
    expect(registry.names).toEqual(["HOUR_HAS_PASSED_EVENT"]);
  });

  test("names - multiple schemas", () => {
    const registry = new EventValidatorRegistryZodAdapter([
      System.Events.HourHasPassedEvent,
      System.Events.MinuteHasPassedEvent,
    ]);

    expect(registry.accepts("HOUR_HAS_PASSED_EVENT")).toEqual(true);
    expect(registry.accepts("MINUTE_HAS_PASSED_EVENT")).toEqual(true);
    expect(registry.names).toEqual(["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"]);
  });

  test("accepts - true", () => {
    expect(registry.accepts("HOUR_HAS_PASSED_EVENT")).toEqual(true);
  });

  test("accepts - false", () => {
    expect(registry.accepts("UNKNOWN_EVENT")).toEqual(false);
  });

  test("validate", () => {
    expect(registry.validate(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });

  test("validate - missing name", () => {
    expect(() => registry.validate({})).toThrow("event.validator.registry.zod.adapter.error.missing.name");
  });

  test("validate - unknown name", () => {
    expect(() => registry.validate({ name: "UNKNOWN_EVENT" })).toThrow(
      "event.validator.registry.zod.adapter.error.unknown.event",
    );
  });

  test("validate - invalid shape", () => {
    expect(() =>
      registry.validate({ ...mocks.GenericHourHasPassedEvent, payload: { timestamp: "not-a-number" } }),
    ).toThrow("timestamp.invalid");
  });

  test("validate - multiple schemas", () => {
    const registry = new EventValidatorRegistryZodAdapter([
      System.Events.HourHasPassedEvent,
      System.Events.MinuteHasPassedEvent,
    ]);

    expect(registry.validate(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
    expect(registry.validate(mocks.GenericMinuteHasPassedEvent)).toEqual(mocks.GenericMinuteHasPassedEvent);
  });
});
