import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityCountermeasureBanAdapter } from "../src/security-countermeasure-ban.adapter";
import { SecurityCountermeasureMirageAdapter } from "../src/security-countermeasure-mirage.adapter";
import { SecurityCountermeasureTarpitAdapter } from "../src/security-countermeasure-tarpit.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleHoneyPotFieldAdapter } from "../src/security-rule-honey-pot-field.adapter";
import { SecurityRuleUserAgentAdapter } from "../src/security-rule-user-agent.adapter";
import { ShieldSecurityAdapter } from "../src/shield-security.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderDeterministicAdapter([
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
]);
const EventStore = { save: async () => {}, saveAfter: async () => {} };
const deps = { Logger, Clock, IdProvider, EventStore };

const mirage = new SecurityCountermeasureMirageAdapter(deps);
const ban = new SecurityCountermeasureBanAdapter(deps);
const config = { duration: tools.Duration.Seconds(5), after: { kind: "allow" } as const };
const tarpit = new SecurityCountermeasureTarpitAdapter(deps, config);

const baitRoutes = new SecurityRuleBaitRoutesAdapter(["/.env"]);
const baitRoutesShield = new ShieldSecurityAdapter(baitRoutes, ban);

const field = "reference";
const honeyPotField = new SecurityRuleHoneyPotFieldAdapter(field);
const honeyPotFieldShield = new ShieldSecurityAdapter(honeyPotField, tarpit);

const userAgent = new SecurityRuleUserAgentAdapter();
const userAgentShield = new ShieldSecurityAdapter(userAgent, mirage);

const app = new Hono()
  .use(
    requestId({
      limitLength: 36,
      headerName: "x-correlation-id",
      generator: () => deps.IdProvider.generate(),
    }),
  )
  .use(CorrelationStorage.handle())
  .use(baitRoutesShield.verify)
  .use(honeyPotFieldShield.verify)
  .use(userAgentShield.verify)
  .post("/ping", (c) => c.text("OK"));

describe("ShieldSecurityAdapter", () => {
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
      { method: "POST", headers: { "x-correlation-id": mocks.correlationId } },
      mocks.ip,
    );

    expect(result.status).toEqual(403);
    expect(loggerInfo).toHaveBeenCalled();
    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericSecurityViolationDetectedEvent]);
  });

  test("denied - HoneyPotField - tarpit - allow", async () => {
    const bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());
    const loggerInfo = spyOn(Logger, "info");

    const result = await app.request(
      "/ping",
      { method: "POST", body: JSON.stringify({ [field]: "here" }) },
      mocks.ip,
    );

    expect(result.status).toEqual(200);
    expect(loggerInfo).toHaveBeenCalled();
    expect(bunSleep).toHaveBeenCalledWith(config.duration.ms);
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
});
