import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import {
  SecurityCountermeasureBanAdapter,
  SecurityCountermeasureBanAdapterError,
} from "../src/security-countermeasure-ban.adapter";
import * as mocks from "./mocks";

const context = { client: { ip: "anon", ua: "anon" } };

const Logger = new LoggerNoopAdapter();
const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventStore = { save: async () => {}, saveAfter: async () => {} };

const deps = { Logger, IdProvider, Clock, EventStore };

const countermeasure = new SecurityCountermeasureBanAdapter(deps);

describe("SecurityCountermeasureBanAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => countermeasure.execute(context)).toThrow(
        SecurityCountermeasureBanAdapterError.Executed,
      );
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: mocks.correlationId,
      metadata: context,
    });
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedEvent]);
  });
});
