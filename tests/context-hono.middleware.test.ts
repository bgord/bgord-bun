import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ContextHonoMiddleware, type ContextVariables } from "../src/context-hono.middleware";
import { CorrelationHonoMiddleware } from "../src/correlation-hono.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { TimeZoneOffsetHonoMiddleware } from "../src/time-zone-offset-hono.middleware";
import * as mocks from "./mocks";

type Config = { Variables: ContextVariables };
const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
const deps = { IdProvider };

describe("ContextHonoMiddleware", () => {
  test("happy path", async () => {
    const context = new ContextHonoMiddleware();
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware(deps).handle())
      .use(new TimeZoneOffsetHonoMiddleware().handle())
      .use(context.handle())
      .get("/ping", (c) => c.json(c.get("context")));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(typeof json.requestId).toEqual("string");
    expect(json.requestId.length).toEqual(36);
    expect(json.timeZoneOffset).toEqual(0);
  });
});
