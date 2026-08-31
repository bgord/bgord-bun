import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { ErrorClassifierUnknownStrategy } from "../src/error-classifier-unknown.strategy";
import { ErrorClassifierWithLoggerStrategy } from "../src/error-classifier-with-logger.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

describe("ErrorHonoHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "first" });
  });

  test("unmatched classifier", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });

  test("no matches", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHonoHandler({ classifiers: [] });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("logged fallback", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHonoHandler({
      classifiers: [],
      fallback: new ErrorClassifierWithLoggerStrategy(
        { operation: "unknown" },
        { inner: new ErrorClassifierUnknownStrategy(), Logger },
      ),
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await CorrelationStorage.run(mocks.correlationId, () => app.request("/ping"));

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
    expect(Logger.entries).toEqual([
      {
        message: "Classified error",
        component: "http",
        operation: "unknown",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 500 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("fallback without a match", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [],
      fallback: new ErrorClassifierMessageMapStrategy({
        "mime.value.invalid": { message: "first", status: 400 },
      }),
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("matching fallback", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [],
      fallback: new ErrorClassifierMessageMapStrategy({
        "revision.mismatch": { message: "second", status: 412 },
      }),
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });
});
