import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { Hash } from "../src/hash.vo";
import { IdempotencyStoreNoopAdapter } from "../src/idempotency-store-noop.adapter";
import { IdempotencyStoreWithLoggerAdapter } from "../src/idempotency-store-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const inner = new IdempotencyStoreNoopAdapter();

const subject = Hash.fromString("a".repeat(64));

describe("IdempotencyStoreWithLoggerAdapter", () => {
  test("claim - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new IdempotencyStoreWithLoggerAdapter({ inner, Logger, Clock });

    expect(await CorrelationStorage.run(mocks.correlationId, async () => adapter.claim(subject))).toEqual(
      true,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim attempt",
        correlationId: mocks.correlationId,
        metadata: { subject: "a".repeat(64) },
      },
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim success",
        correlationId: mocks.correlationId,
        metadata: { subject: "a".repeat(64), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("claim - duplicate", async () => {
    const Logger = new LoggerCollectingAdapter();
    using _ = spyOn(inner, "claim").mockResolvedValue(false);
    const adapter = new IdempotencyStoreWithLoggerAdapter({ inner, Logger, Clock });

    expect(await CorrelationStorage.run(mocks.correlationId, async () => adapter.claim(subject))).toEqual(
      false,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim attempt",
        correlationId: mocks.correlationId,
        metadata: { subject: "a".repeat(64) },
      },
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim duplicate",
        correlationId: mocks.correlationId,
        metadata: { subject: "a".repeat(64), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("claim - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    using _ = spyOn(inner, "claim").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new IdempotencyStoreWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.claim(subject)),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim attempt",
        correlationId: mocks.correlationId,
        metadata: { subject: "a".repeat(64) },
      },
      {
        component: "infra",
        operation: "idempotency_store",
        message: "Idempotency store claim error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { subject: "a".repeat(64), duration: expect.any(tools.Duration) },
      },
    ]);
  });
});
