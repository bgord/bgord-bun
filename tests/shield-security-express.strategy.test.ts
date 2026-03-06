import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationExpressMiddleware } from "../src/correlation-express.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureNoopStrategy } from "../src/security-countermeasure-noop.strategy";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityPolicy } from "../src/security-policy.vo";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import { ShieldSecurityExpressStrategy } from "../src/shield-security-express.strategy";
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

describe("ShieldSecurityExpressStrategy", () => {
  test("no violation", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(pass, noop)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, noop)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const ban = new SecurityCountermeasureBanStrategy({ ...deps, IdProvider });
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, ban)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(403);
    expect(result.text).toEqual("security.countermeasure.ban.strategy.executed");
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const mirage = new SecurityCountermeasureMirageStrategy(deps);
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, mirage)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("delay - allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, { duration, after: { kind: "allow" } });
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "deny", reason: "rejected", response: { status: 403 } },
    });
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(403);
    expect(result.text).toEqual("rejected");
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "mirage", response: { status: 200 } },
    });
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("delay - delay", async () => {
    using loggerInfo = spyOn(Logger, "info");
    using sleeperWait = spyOn(Sleeper, "wait");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "delay", duration, after: { kind: "allow" } },
    });
    const shield = new ShieldSecurityExpressStrategy([new SecurityPolicy(fail, tarpit)], deps);

    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .use(shield.handle())
      .post("/ping", (_request, response) => response.send("OK"))
      .use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(500).send(error.message);
      });

    const result = await request(app).post("/ping");

    expect(result.status).toEqual(500);
    expect(result.text).toEqual("shield.security.express.strategy.error.unhandled");
    expect(loggerInfo).toHaveBeenCalled();
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });

  test("missing policies", () => {
    expect(() => new ShieldSecurityExpressStrategy([], deps)).toThrow(
      "shield.security.strategy.error.missing.policies",
    );
  });

  test("just enough policies", () => {
    const policy = new SecurityPolicy(pass, noop);

    expect(
      () => new ShieldSecurityExpressStrategy([policy, policy, policy, policy, policy], deps),
    ).not.toThrow();
  });

  test("max policies", () => {
    const policy = new SecurityPolicy(pass, noop);

    expect(
      () => new ShieldSecurityExpressStrategy([policy, policy, policy, policy, policy, policy], deps),
    ).toThrow("shield.security.strategy.error.max.policies");
  });
});
