import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { ErrorHandler } from "../src/error.handler";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { ErrorClassifierUnknownStrategy } from "../src/error-classifier-unknown.strategy";
import { ErrorClassifierWithLoggerStrategy } from "../src/error-classifier-with-logger.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const context = new RequestContextBuilder().build();

describe("ErrorHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "first" });
  });

  test("unmatched classifier", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });

  test("no matches", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHandler({ classifiers: [] });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("logged fallback", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHandler({
      classifiers: [],
      fallback: new ErrorClassifierWithLoggerStrategy(
        { operation: "unknown" },
        { inner: new ErrorClassifierUnknownStrategy(), Logger },
      ),
    });

    const result = await CorrelationStorage.run(mocks.correlationId, () =>
      handler.handle(
        new Error("revision.mismatch"),
        new RequestContextBuilder().withUrl("http://localhost/ping").build(),
      ),
    );

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
    const handler = new ErrorHandler({
      classifiers: [],
      fallback: new ErrorClassifierMessageMapStrategy({
        "mime.value.invalid": { message: "first", status: 400 },
      }),
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("matching fallback", async () => {
    const handler = new ErrorHandler({
      classifiers: [],
      fallback: new ErrorClassifierMessageMapStrategy({
        "revision.mismatch": { message: "second", status: 412 },
      }),
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });
});
