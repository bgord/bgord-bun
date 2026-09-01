import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { ErrorHandler } from "../src/error.handler";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const context = new RequestContextBuilder().build();

describe("ErrorHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "first" });
  });

  test("unmatched classifier", async () => {
    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });

  test("no matches", async () => {
    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );

    const result = await CorrelationStorage.run(mocks.correlationId, () =>
      handler.handle(new Error("revision.mismatch"), context),
    );

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHandler({ classifiers: [] }, { Logger: new LoggerNoopAdapter() });

    const result = await CorrelationStorage.run(mocks.correlationId, () =>
      handler.handle(new Error("revision.mismatch"), context),
    );

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("terminal classifier logs the unknown error", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHandler({ classifiers: [] }, { Logger });

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
        operation: "unknown_error",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 500 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("terminal classifier does not log a classified error", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
        ],
      },
      { Logger },
    );

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(Logger.entries).toEqual([]);
  });

  test("trailing classifier without a match", async () => {
    const Logger = new LoggerCollectingAdapter();

    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({
            "mime.value.invalid": { message: "first", status: 400 },
          }),
        ],
      },
      { Logger },
    );

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
        operation: "unknown_error",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 500 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("matching trailing classifier", async () => {
    const handler = new ErrorHandler(
      {
        classifiers: [
          new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
          new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
        ],
      },
      { Logger: new LoggerNoopAdapter() },
    );

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });
});
