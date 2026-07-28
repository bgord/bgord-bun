import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { BuildInfo, type BuildInfoType } from "../src/build-info.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import type { SecurityViolationDetectedEventType } from "../src/modules/system/events/SECURITY_VIOLATION_DETECTED_EVENT";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoConfig = new ReactiveConfigNoopAdapter<BuildInfoType>(BuildInfo, {
  timestamp: tools.Timestamp.fromNumber(1767775662000).ms,
  version: v.parse(tools.PackageVersionSchema, "v1.0.0"),
  sha: CommitSha.fromString("a".repeat(40)).value,
  size: tools.Size.fromBytes(0).toBytes(),
});

const rule = new SecurityRulePassStrategy();

describe("SecurityCountermeasureBanStrategy", () => {
  test("happy path", async () => {
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const countermeasure = new SecurityCountermeasureBanStrategy({
      Clock,
      EventStore,
      Logger,
      IdProvider,
      BuildInfoConfig,
    });
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
    const countermeasure = new SecurityCountermeasureBanStrategy({
      EventStore,
      Clock,
      Logger,
      IdProvider,
      BuildInfoConfig,
    });
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
      { EventStore, Clock, Logger, IdProvider, BuildInfoConfig },
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
    const countermeasure = new SecurityCountermeasureBanStrategy({
      EventStore,
      Clock,
      Logger,
      IdProvider,
      BuildInfoConfig,
    });

    expect(countermeasure.name).toEqual(v.parse(SecurityCountermeasureName, "ban"));
  });
});
