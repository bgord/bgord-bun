import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationHonoMiddleware } from "../src/correlation-hono.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureNoopStrategy } from "../src/security-countermeasure-noop.strategy";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityPolicy } from "../src/security-policy.vo";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import { ShieldSecurityHonoStrategy } from "../src/shield-security-hono.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Sleeper = new SleeperNoopAdapter();
const EventStore = { save: async () => {} };
const deps = { Logger, Clock, EventStore, Sleeper };

const pass = new SecurityRulePassStrategy();
const fail = new SecurityRuleFailStrategy();

const noop = new SecurityCountermeasureNoopStrategy();

const duration = tools.Duration.Seconds(5);

describe("ShieldSecurityHonoStrategy", () => {
  test("no violation", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(pass, noop)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, noop)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const ban = new SecurityCountermeasureBanStrategy({ ...deps, IdProvider });
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, ban)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(403);
    expect(await result.text()).toEqual("security.countermeasure.ban.strategy.executed");
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const mirage = new SecurityCountermeasureMirageStrategy(deps);
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, mirage)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("delay - allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, { duration, after: { kind: "allow" } });
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "deny", reason: "rejected", response: { status: 403 } },
    });
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(403);
    expect(await result.text()).toEqual("rejected");
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "mirage", response: { status: 200 } },
    });
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - delay", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "delay", duration, after: { kind: "allow" } },
    });
    const shield = new ShieldSecurityHonoStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = new Hono()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (c) => c.text("OK"))
      .onError((error, c) => c.text(error.message, 500));

    const result = await app.request("/ping", { method: "POST" }, mocks.connInfo);

    expect(result.status).toEqual(500);
    expect(await result.text()).toEqual("shield.security.hono.strategy.error.unhandled");
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("missing policies", () => {
    expect(() => new ShieldSecurityHonoStrategy([], deps)).toThrow(
      "shield.security.strategy.error.missing.policies",
    );
  });

  test("just enough policies", () => {
    const policy = new SecurityPolicy(pass, noop);

    expect(
      () => new ShieldSecurityHonoStrategy([policy, policy, policy, policy, policy], deps),
    ).not.toThrow();
  });

  test("max policies", () => {
    const policy = new SecurityPolicy(pass, noop);

    expect(
      () => new ShieldSecurityHonoStrategy([policy, policy, policy, policy, policy, policy], deps),
    ).toThrow("shield.security.strategy.error.max.policies");
  });
});
