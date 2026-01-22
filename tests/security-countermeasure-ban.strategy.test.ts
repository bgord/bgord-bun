import { describe, expect, spyOn, test } from "bun:test";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Client } from "../src/client.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const IdProvider = new IdProviderDeterministicAdapter([
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
]);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventStore = { save: async () => {} };
const deps = { Logger, IdProvider, Clock, EventStore };

const rule = new SecurityRulePassStrategy();
const countermeasure = new SecurityCountermeasureBanStrategy(deps);
const context = new SecurityContext(
  rule.name,
  countermeasure.name,
  Client.fromParts("127.0.0.1", "firefox"),
  undefined,
);
const contextWithoutClient = new SecurityContext(
  rule.name,
  countermeasure.name,
  Client.fromParts(undefined, undefined),
  undefined,
);

describe("SecurityCountermeasureBanStrategy", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
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

  test("happy path - without client", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(contextWithoutClient);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: mocks.correlationId,
      metadata: contextWithoutClient,
    });
    expect(eventStoreSave).toHaveBeenCalledWith([
      mocks.GenericSecurityViolationDetectedBanDenyWithoutContextEvent,
    ]);
  });

  test("happy path - custom config", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(deps.EventStore, "save");
    const config = { response: { status: 404 as ContentfulStatusCode } };
    const countermeasure = new SecurityCountermeasureBanStrategy(deps, config);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
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
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("ban"));
  });
});
