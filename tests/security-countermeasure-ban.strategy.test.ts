import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import type { SecurityViolationDetectedEventType } from "../src/modules/system/events/SECURITY_VIOLATION_DETECTED_EVENT";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const rule = new SecurityRulePassStrategy();

describe("SecurityCountermeasureBanStrategy", () => {
  test("happy path", async () => {
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const countermeasure = new SecurityCountermeasureBanStrategy({ Clock, EventStore, Logger, IdProvider });
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(await countermeasure.execute(context)).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      }),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
    expect(EventStore.saved).toEqual([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("happy path - without client", async () => {
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const countermeasure = new SecurityCountermeasureBanStrategy({ EventStore, Clock, Logger, IdProvider });
    const contextWithoutClient = new SecurityContext(
      rule.name,
      countermeasure.name,
      mocks.clientEmpty,
      undefined,
    );

    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(await countermeasure.execute(contextWithoutClient)).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      }),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: contextWithoutClient,
      },
    ]);
    expect(EventStore.saved).toEqual([mocks.GenericSecurityViolationDetectedBanDenyWithoutContextEvent]);
  });

  test("happy path - custom config", async () => {
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const config = { response: { status: 404 } };
    const countermeasure = new SecurityCountermeasureBanStrategy(
      { EventStore, Clock, Logger, IdProvider },
      config,
    );
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(await countermeasure.execute(context)).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        ...config,
      }),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure ban",
        component: "security",
        operation: "security_countermeasure_ban",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
    expect(EventStore.saved).toEqual([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("name", () => {
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const countermeasure = new SecurityCountermeasureBanStrategy({ EventStore, Clock, Logger, IdProvider });

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("ban"));
  });
});
