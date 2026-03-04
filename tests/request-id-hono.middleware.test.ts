import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { RequestIdHonoMiddleware } from "../src/request-id-hono.middleware";
import * as mocks from "./mocks";

const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);

const valid = "550e8400-e29b-41d4-a716-446655440000";
const invalid = "not-a-valid-uuid";

const app = new Hono()
  .use(new RequestIdHonoMiddleware({ IdProvider }).handle())
  .get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

describe("RequestId middleware", () => {
  test("no incoming", async () => {
    const result = await app.request("/ping");

    expect(await result.json()).toEqual({ requestId: mocks.correlationId });
    expect(result.headers.get("x-correlation-id")).toEqual(mocks.correlationId);
  });

  test("incoming - correct", async () => {
    const result = await app.request("/ping", { headers: new Headers({ "x-correlation-id": valid }) });

    expect(await result.json()).toEqual({ requestId: valid });
    expect(result.headers.get("x-correlation-id")).toEqual(valid);
  });

  test("incoming - incorrect", async () => {
    const result = await app.request("/ping", { headers: new Headers({ "x-correlation-id": invalid }) });

    expect(await result.json()).toEqual({ requestId: mocks.correlationId });
    expect(result.headers.get("x-correlation-id")).toEqual(mocks.correlationId);
  });
});
