import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { ErrorClassifierWithLoggerStrategy } from "../src/error-classifier-with-logger.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const inner = new ErrorClassifierMessageMapStrategy({
  "revision.mismatch": { message: "revision.mismatch", status: 412 },
});

const context = new RequestContextBuilder().withUrl("http://localhost/ping").build();

describe("ErrorClassifierWithLoggerStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const strategy = new ErrorClassifierWithLoggerStrategy({ operation: "revision" }, { inner, Logger });

    const result = await CorrelationStorage.run(mocks.correlationId, () =>
      strategy.classify(new Error("revision.mismatch"), context),
    );

    expect(result?.status).toEqual(412);
    expect(await result?.json()).toEqual({ message: "revision.mismatch" });
    expect(Logger.entries).toEqual([
      {
        message: "Classified error",
        component: "http",
        operation: "revision",
        correlationId: mocks.correlationId,
        metadata: { url: "http://localhost/ping", status: 412 },
        error: new Error("revision.mismatch"),
      },
    ]);
  });

  test("no match", async () => {
    const Logger = new LoggerCollectingAdapter();
    const strategy = new ErrorClassifierWithLoggerStrategy({ operation: "revision" }, { inner, Logger });

    const result = await CorrelationStorage.run(mocks.correlationId, () =>
      strategy.classify(new Error("mime.value.invalid"), context),
    );

    expect(result).toEqual(null);
    expect(Logger.entries).toEqual([]);
  });
});
