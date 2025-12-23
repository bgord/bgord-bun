import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import {
  SecurityCountermeasureReportAdapter,
  SecurityCountermeasureReportAdapterError,
} from "../src/security-countermeasure-report.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleHoneyPotFieldAdapter } from "../src/security-rule-honey-pot-field.adapter";
import { ShieldSecurityAdapter } from "../src/shield-security.adapter";
import * as mocks from "./mocks";

const baitRoutes = new SecurityRuleBaitRoutesAdapter(["/.env"]);

const field = "reference";
const honeyPotField = new SecurityRuleHoneyPotFieldAdapter(field);

const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const countermeasure = new SecurityCountermeasureReportAdapter(deps);

const baitRoutesShield = new ShieldSecurityAdapter(baitRoutes, countermeasure);
const honeyPotFieldShield = new ShieldSecurityAdapter(honeyPotField, countermeasure);

const app = new Hono()
  .use(CorrelationStorage.handle())
  .use(baitRoutesShield.verify)
  .use(honeyPotFieldShield.verify)
  .post("/ping", (c) => c.text("OK"))
  .onError((error, c) => c.text(error.message, 500));

describe("ShieldSecurityAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const result = await app.request("/ping", { method: "POST" }, mocks.ip);

    expect(result.status).toEqual(200);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("denied - BaitRoutes", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = await app.request("/.env", { method: "POST" }, mocks.ip);
    const text = await result.text();

    expect(result.status).toEqual(500);
    expect(text).toEqual(SecurityCountermeasureReportAdapterError.Executed);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("denied - HoneyPotField", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = await app.request(
      "/ping",
      { method: "POST", body: JSON.stringify({ [field]: "here" }) },
      mocks.ip,
    );
    const text = await result.text();

    expect(result.status).toEqual(500);
    expect(text).toEqual(SecurityCountermeasureReportAdapterError.Executed);
    expect(loggerInfo).toHaveBeenCalled();
  });
});
