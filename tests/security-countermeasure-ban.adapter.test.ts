import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import {
  SecurityCountermeasureBanAdapter,
  SecurityCountermeasureBanAdapterError,
} from "../src/security-countermeasure-ban.adapter";
import { SecurityRuleNoopAdapter } from "../src/security-rule-noop.adapter";
import * as mocks from "./mocks";

const rule = new SecurityRuleNoopAdapter();
const context = new SecurityContext(rule.name, Client.fromParts("anon", "anon"), undefined);

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
      expect(await countermeasure.execute(context)).toEqual({
        kind: "deny",
        reason: SecurityCountermeasureBanAdapterError.Executed,
      });
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
