import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityPolicy } from "../src/security-policy.vo";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRuleHoneyPotFieldStrategy } from "../src/security-rule-honey-pot-field.strategy";
import { SecurityRuleUserAgentStrategy } from "../src/security-rule-user-agent.strategy";
import { SecurityRuleViolationThresholdStrategy } from "../src/security-rule-violation-threshold.strategy";
import { ShieldSecurityStrategy } from "../src/shield-security.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const duration = tools.Duration.Seconds(5);

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
const Sleeper = new SleeperNoopAdapter();
const EventStore = { save: async () => {} };
const HashContent = new HashContentSha256Strategy();
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: duration });
const deps = { Logger, Clock, IdProvider, EventStore, HashContent, CacheRepository, Sleeper };

const mirage = new SecurityCountermeasureMirageStrategy(deps);
const ban = new SecurityCountermeasureBanStrategy(deps);
const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
  duration,
  after: { kind: "allow" } as const,
});

const baitRoutes = new SecurityRuleBaitRoutesStrategy(["/.env"]);
const field = "reference";
const honeyPotField = new SecurityRuleHoneyPotFieldStrategy(field);
const userAgent = new SecurityRuleUserAgentStrategy();
const fail = new SecurityRuleFailStrategy();

const banBaitRoutes = new SecurityPolicy(baitRoutes, ban);
const tarpitHoneyPotField = new SecurityPolicy(honeyPotField, tarpit);
const mirageUserAgent = new SecurityPolicy(userAgent, mirage);
const mirageFail = new SecurityPolicy(fail, mirage);

const compositeStrategy = new ShieldSecurityStrategy([banBaitRoutes, tarpitHoneyPotField, mirageUserAgent]);

describe("ShieldSecurityStrategy", () => {
  test("happy path", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const context = new RequestContextBuilder().withPath("/ping").build();

    const action = await compositeStrategy.evaluate(context);

    expect(action).toEqual(null);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("denied - BaitRoutes - ban", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using eventStoreSave = spyOn(EventStore, "save");
    const context = new RequestContextBuilder().withPath("/.env").withIp(mocks.ip).withUa(mocks.ua).build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await compositeStrategy.evaluate(context);

      expect(action).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      });
      expect(loggerInfo).toHaveBeenCalled();
      expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
    });
  });

  test("denied - HoneyPotField - tarpit - allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const context = new RequestContextBuilder()
      .withPath("/ping")
      .withJson({ [field]: "here" })
      .build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await compositeStrategy.evaluate(context);

      expect(action).toEqual({ kind: "delay", duration, after: { kind: "allow" } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("denied - UserAgent - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const context = new RequestContextBuilder().withPath("/ping").withUa("AI2Bot-DeepResearchEval").build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await compositeStrategy.evaluate(context);

      expect(action).toEqual({ kind: "mirage", response: { status: 200 } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("denied - Fail - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const strategy = new ShieldSecurityStrategy([mirageFail]);
    const context = new RequestContextBuilder().withPath("/ping").build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await strategy.evaluate(context);

      expect(action).toEqual({ kind: "mirage", response: { status: 200 } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("denied - Violation Threshold - BaitRoutes - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const rule = new SecurityRuleViolationThresholdStrategy(
      baitRoutes,
      { threshold: tools.IntegerPositive.parse(3) },
      deps,
    );
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(rule, mirage)]);
    const context = new RequestContextBuilder().withPath("/.env").build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const first = await strategy.evaluate(context);
      expect(first).toEqual(null);
      expect(loggerInfo).not.toHaveBeenCalled();

      const second = await strategy.evaluate(context);
      expect(second).toEqual(null);
      expect(loggerInfo).not.toHaveBeenCalled();

      const third = await strategy.evaluate(context);
      expect(third).toEqual({ kind: "mirage", response: { status: 200 } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("missing policies", () => {
    expect(() => new ShieldSecurityStrategy([])).toThrow("shield.security.strategy.error.missing.policies");
  });

  test("just enough policies", () => {
    expect(
      () => new ShieldSecurityStrategy([mirageFail, mirageFail, mirageFail, mirageFail, mirageFail]),
    ).not.toThrow();
  });

  test("max policies", () => {
    expect(
      () =>
        new ShieldSecurityStrategy([mirageFail, mirageFail, mirageFail, mirageFail, mirageFail, mirageFail]),
    ).toThrow("shield.security.strategy.error.max.policies");
  });
});
