import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CorrelationHonoMiddleware, type CorrelationVariables } from "../src/correlation-hono.middleware";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { RequestIdMiddleware } from "../src/request-id.middleware";
import * as mocks from "./mocks";

type Config = { Variables: CorrelationVariables };

const valid = "550e8400-e29b-41d4-a716-446655440000";
const invalid = "not-a-valid-uuid";

describe("CorrelationHonoMiddleware", () => {
  test("no incoming", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) => c.json({ requestId: c.get("requestId"), storage: CorrelationStorage.get() }));

    const response = await app.request("/ping");

    expect(response.headers.get(RequestIdMiddleware.HEADER_NAME)).toEqual(mocks.correlationId);
    expect(await response.json()).toEqual({ requestId: mocks.correlationId, storage: mocks.correlationId });
  });

  test("incoming - correct", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 0));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) => c.json({ requestId: c.get("requestId"), storage: CorrelationStorage.get() }));

    const response = await app.request("/ping", { headers: { [RequestIdMiddleware.HEADER_NAME]: valid } });

    expect(response.headers.get(RequestIdMiddleware.HEADER_NAME)).toEqual(valid);
    expect(await response.json()).toEqual({ requestId: valid, storage: valid });
  });

  test("incoming - incorrect", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) => c.json({ requestId: c.get("requestId"), storage: CorrelationStorage.get() }));

    const response = await app.request("/ping", { headers: { [RequestIdMiddleware.HEADER_NAME]: invalid } });

    expect(response.headers.get(RequestIdMiddleware.HEADER_NAME)).toEqual(mocks.correlationId);
    expect(await response.json()).toEqual({ requestId: mocks.correlationId, storage: mocks.correlationId });
  });

  test("cleanup", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) => c.json({}));

    await app.request("/ping");

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });
});
