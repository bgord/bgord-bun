import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { CorrelationExpressMiddleware } from "../src/correlation-express.middleware";
import { CorrelationIdMiddleware } from "../src/correlation-id.middleware";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

const valid = "550e8400-e29b-41d4-a716-446655440000";
const invalid = "not-a-valid-uuid";

describe("CorrelationExpressMiddleware", () => {
  test("no incoming", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .get("/ping", (req, res) =>
        res.json({ correlationId: req.correlationId, storage: CorrelationStorage.get() }),
      );

    const response = await request(app).get("/ping");

    expect(response.headers[CorrelationIdMiddleware.HEADER_NAME.toLowerCase()]).toEqual(mocks.correlationId);
    expect(response.body).toEqual({
      correlationId: mocks.correlationId,
      storage: mocks.correlationId,
    });
  });

  test("incoming - correct", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 0));
    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .get("/ping", (req, res) =>
        res.json({ correlationId: req.correlationId, storage: CorrelationStorage.get() }),
      );

    const response = await request(app).get("/ping").set(CorrelationIdMiddleware.HEADER_NAME, valid);

    expect(response.headers[CorrelationIdMiddleware.HEADER_NAME.toLowerCase()]).toEqual(valid);
    expect(response.body).toEqual({ correlationId: valid, storage: valid });
  });

  test("incoming - incorrect", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .get("/ping", (req, res) =>
        res.json({ correlationId: req.correlationId, storage: CorrelationStorage.get() }),
      );

    const response = await request(app).get("/ping").set(CorrelationIdMiddleware.HEADER_NAME, invalid);

    expect(response.headers[CorrelationIdMiddleware.HEADER_NAME.toLowerCase()]).toEqual(mocks.correlationId);
    expect(response.body).toEqual({
      correlationId: mocks.correlationId,
      storage: mocks.correlationId,
    });
  });

  test("cleanup", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express()
      .use(new CorrelationExpressMiddleware({ IdProvider }).handle())
      .get("/ping", (_req, res) => res.json({}));

    await request(app).get("/ping");

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });
});
