import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CorrelationStorageHonoMiddleware } from "../src/correlation-storage-hono.middleware";
import * as mocks from "./mocks";

const middleware = new CorrelationStorageHonoMiddleware();

describe("CorrelationStorageHonoMiddleware", () => {
  test("handle - seeding", async () => {
    const app = new Hono()
      .use(requestId({ generator: () => mocks.correlationId }))
      .use(middleware.handle())
      .get("/", (c) => c.text(CorrelationStorage.get()));

    const response = await app.request("/");

    expect(await response.text()).toEqual(mocks.correlationId);
    expect(response.status).toEqual(200);
  });

  test("handle - cleanup", async () => {
    const app = new Hono()
      .use(requestId({ generator: () => mocks.correlationId }))
      .use(middleware.handle())
      .get("/", (c) => c.text("ok"));

    await app.request("/");

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });
});
