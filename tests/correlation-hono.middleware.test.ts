import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CorrelationHonoMiddleware, type CorrelationVariables } from "../src/correlation-hono.middleware";
import { CorrelationIdMiddleware } from "../src/correlation-id.middleware";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

type Config = { Variables: CorrelationVariables };

const invalid = "not-a-valid-uuid";

describe("CorrelationHonoMiddleware", () => {
  test("no incoming", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) =>
        c.json({ correlationId: c.get("correlationId"), storage: CorrelationStorage.get() }),
      );

    const response = await app.request("/ping");

    expect(response.headers.get(CorrelationIdMiddleware.HEADER_NAME)).toEqual(mocks.correlationId);
    expect(await response.json()).toEqual({
      correlationId: mocks.correlationId,
      storage: mocks.correlationId,
    });
  });

  test("incoming - correct", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 0));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) =>
        c.json({ correlationId: c.get("correlationId"), storage: CorrelationStorage.get() }),
      );

    const response = await app.request("/ping", {
      headers: { [CorrelationIdMiddleware.HEADER_NAME]: mocks.correlationId },
    });

    expect(response.headers.get(CorrelationIdMiddleware.HEADER_NAME)).toEqual(mocks.correlationId);
    expect(await response.json()).toEqual({
      correlationId: mocks.correlationId,
      storage: mocks.correlationId,
    });
  });

  test("incoming - incorrect", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = new Hono<Config>()
      .use(new CorrelationHonoMiddleware({ IdProvider }).handle())
      .get("/ping", (c) =>
        c.json({ correlationId: c.get("correlationId"), storage: CorrelationStorage.get() }),
      );

    const response = await app.request("/ping", {
      headers: { [CorrelationIdMiddleware.HEADER_NAME]: invalid },
    });

    expect(response.headers.get(CorrelationIdMiddleware.HEADER_NAME)).toEqual(mocks.correlationId);
    expect(await response.json()).toEqual({
      correlationId: mocks.correlationId,
      storage: mocks.correlationId,
    });
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
