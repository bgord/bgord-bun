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
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassAdapter } from "../src/security-rule-pass.adapter";
import * as mocks from "./mocks";

const rule = new SecurityRulePassAdapter();
const context = new SecurityContext(rule.name, Client.fromParts("127.0.0.1", "anon"), undefined);

const Logger = new LoggerNoopAdapter();
const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventStore = { save: async () => {}, saveAfter: async () => {} };
const deps = { Logger, IdProvider, Clock, EventStore };

describe("SecurityCountermeasureBanAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");
    const countermeasure = new SecurityCountermeasureBanAdapter(deps);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: SecurityCountermeasureBanAdapterError.Executed,
        response: { status: 403 },
      });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: mocks.correlationId,
      metadata: context,
    });
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("happy path - custom config", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");
    const config = { response: { status: 404 } };
    const countermeasure = new SecurityCountermeasureBanAdapter(deps, config);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: SecurityCountermeasureBanAdapterError.Executed,
        ...config,
      });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: mocks.correlationId,
      metadata: context,
    });
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("name", () => {
    const countermeasure = new SecurityCountermeasureBanAdapter(deps);

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("ban"));
  });
});
