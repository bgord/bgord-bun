import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventStore = { save: async () => {} };
const deps = { Clock, EventStore };

const rule = new SecurityRulePassStrategy();

describe("SecurityCountermeasureBanStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const countermeasure = new SecurityCountermeasureBanStrategy({ ...deps, Logger, IdProvider });
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);
    using eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      });
    });

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("happy path - without client", async () => {
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const countermeasure = new SecurityCountermeasureBanStrategy({ ...deps, Logger, IdProvider });
    const contextWithoutClient = new SecurityContext(
      rule.name,
      countermeasure.name,
      mocks.clientEmpty,
      undefined,
    );
    using eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(contextWithoutClient);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      });
    });

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: contextWithoutClient,
      },
    ]);
    expect(eventStoreSave).toHaveBeenCalledWith([
      mocks.GenericSecurityViolationDetectedBanDenyWithoutContextEvent,
    ]);
  });

  test("happy path - custom config", async () => {
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const config = { response: { status: 404 } };
    const countermeasure = new SecurityCountermeasureBanStrategy({ ...deps, Logger, IdProvider }, config);
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);
    using eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        ...config,
      });
    });

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("name", () => {
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const countermeasure = new SecurityCountermeasureBanStrategy({ ...deps, Logger, IdProvider });

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("ban"));
  });
});
