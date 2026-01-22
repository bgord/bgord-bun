import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
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

const duration = tools.Duration.Seconds(5);

// Dependencies ================================
const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderDeterministicAdapter([
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
]);
const Sleeper = new SleeperNoopAdapter();
const EventStore = { save: async () => {} };
const HashContent = new HashContentSha256BunStrategy();
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: duration });
const deps = { Logger, Clock, IdProvider, EventStore, HashContent, CacheRepository, Sleeper };
// =============================================

// Countermeasures =============================
const mirage = new SecurityCountermeasureMirageStrategy(deps);
const ban = new SecurityCountermeasureBanStrategy(deps);
const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
  duration,
  after: { kind: "allow" } as const,
});
// =============================================

// Rules =======================================
const baitRoutes = new SecurityRuleBaitRoutesStrategy(["/.env"]);
const field = "reference";
const honeyPotField = new SecurityRuleHoneyPotFieldStrategy(field);
const userAgent = new SecurityRuleUserAgentStrategy();
const fail = new SecurityRuleFailStrategy();
// =============================================

// Policies ====================================
const banBaitRoutes = new SecurityPolicy(baitRoutes, ban);
const tarpitHoneyPotField = new SecurityPolicy(honeyPotField, tarpit);
const mirageUserAgent = new SecurityPolicy(userAgent, mirage);
const mirageFail = new SecurityPolicy(fail, mirage);
// =============================================

// Shields =====================================
const compositeShield = new ShieldSecurityStrategy(
  [banBaitRoutes, tarpitHoneyPotField, mirageUserAgent],
  deps,
);
// =============================================

const app = new Hono()
  .use(
    requestId({
      limitLength: 36,
      headerName: "x-correlation-id",
      generator: () => deps.IdProvider.generate(),
    }),
  )
  .use(CorrelationStorage.handle())
  .use(compositeShield.verify)
  .post("/ping", (c) => c.text("OK"));

describe("ShieldSecurityStrategy", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const result = await app.request("/ping", { method: "POST" }, mocks.ip);

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("denied - BaitRoutes - ban", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const eventStoreSave = spyOn(EventStore, "save");

    const result = await app.request(
      "/.env",
      { method: "POST", headers: { "x-correlation-id": mocks.correlationId, "user-agent": "firefox" } },
      mocks.ip,
    );

    expect(result.status).toEqual(403);
    expect(loggerInfo).toHaveBeenCalled();
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
  });

  test("denied - HoneyPotField - tarpit - allow", async () => {
    const sleeperWait = spyOn(Sleeper, "wait");
    const loggerInfo = spyOn(Logger, "info");

    const result = await app.request(
      "/ping",
      { method: "POST", body: JSON.stringify({ [field]: "here" }) },
      mocks.ip,
    );

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("denied - UserAgent - mirage", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = await app.request(
      "/ping",
      { method: "POST", headers: { "user-agent": "AI2Bot-DeepResearchEval" } },
      mocks.ip,
    );

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("denied - Fail - mirage", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const shield = new ShieldSecurityStrategy([mirageFail], deps);
    const app = new Hono()
      .use(CorrelationStorage.handle())
      .use(shield.verify)
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.ip);

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("denied - Violation Threshold - BaitRoutes - mirage", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const rule = new SecurityRuleViolationThresholdStrategy(
      baitRoutes,
      { threshold: tools.IntegerPositive.parse(3) },
      deps,
    );
    const shield = new ShieldSecurityStrategy([new SecurityPolicy(rule, mirage)], deps);
    const app = new Hono()
      .use(CorrelationStorage.handle())
      .use(shield.verify)
      .post("/ping", (c) => c.text("OK"))
      .onError((error, c) => c.text(error.message, 500));

    const first = await app.request("/.env", { method: "POST" }, mocks.ip);

    expect(first.status).toEqual(404);
    expect(loggerInfo).not.toHaveBeenCalled();

    const second = await app.request("/.env", { method: "POST" }, mocks.ip);

    expect(second.status).toEqual(404);
    expect(loggerInfo).not.toHaveBeenCalled();

    const third = await app.request("/.env", { method: "POST" }, mocks.ip);

    expect(third.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("unhandled security error", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const sleeperWait = spyOn(Sleeper, "wait");
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "delay", duration },
    } as any);
    const shield = new ShieldSecurityStrategy(
      [new SecurityPolicy(new SecurityRuleFailStrategy(), tarpit)],
      deps,
    );
    const app = new Hono()
      .use(CorrelationStorage.handle())
      .use(shield.verify)
      .post("/ping", (c) => c.text("OK"))
      .onError((error, c) => c.text(error.message, 500));

    const result = await app.request("/ping", { method: "POST" }, mocks.ip);
    const text = await result.text();

    expect(result.status).toEqual(500);
    expect(text).toEqual("shield.security.adapter.error.unhandled");
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalled();
  });

  test("missing policies", () => {
    expect(() => new ShieldSecurityStrategy([], deps)).toThrow(
      "shield.security.adapter.error.missing.policies",
    );
  });

  test("just enough policies", () => {
    expect(
      () => new ShieldSecurityStrategy([mirageFail, mirageFail, mirageFail, mirageFail, mirageFail], deps),
    ).not.toThrow();
  });

  test("max policies", () => {
    expect(
      () =>
        new ShieldSecurityStrategy(
          [mirageFail, mirageFail, mirageFail, mirageFail, mirageFail, mirageFail],
          deps,
        ),
    ).toThrow("shield.security.adapter.error.max.policies");
  });
});
