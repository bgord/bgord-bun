import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

describe("ErrorHonoHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHonoHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );
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
    const handler = new ErrorHonoHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );
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
    const handler = new ErrorHonoHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await CorrelationStorage.run(mocks.correlationId, () => app.request("/ping"));

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHonoHandler({ classifiers: [] }, { Logger: new LoggerNoopAdapter() });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await CorrelationStorage.run(mocks.correlationId, () => app.request("/ping"));

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("terminal classifier logs the unknown error", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHonoHandler({ classifiers: [] }, { Logger });
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
        operation: "unknown_error",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 500 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("trailing classifier without a match", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHonoHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({
            "mime.value.invalid": { message: "first", status: 400 },
          }),
        ],
      },
      { Logger },
    );
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
        operation: "unknown_error",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 500 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("matching trailing classifier", async () => {
    const handler = new ErrorHonoHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );
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
