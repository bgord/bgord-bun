import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import { RemoteFileStorageWithLoggerAdapter } from "../src/remote-file-storage-with-logger.adapter";
import * as mocks from "./mocks";

const root = v.parse(tools.DirectoryPathAbsoluteSchema, "/root");
const key = v.parse(tools.ObjectKey, "users/1/avatar.webp");
const path = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("RemoteFileStorageWithLoggerAdapter", () => {
  test("putFromPath - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const result = await adapter.putFromPath({ key, path });

      expect(result.size.toBytes()).toEqual(v.parse(tools.SizeBytes, 10));
      expect(Logger.entries).toEqual([
        {
          component: "infra",
          operation: "remote_file_storage",
          message: "Remote file storage put attempt",
          correlationId: mocks.correlationId,
          metadata: { key },
        },
        {
          component: "infra",
          operation: "remote_file_storage",
          message: "Remote file storage put success",
          correlationId: mocks.correlationId,
          metadata: { key, size: result.size, duration: expect.any(tools.Duration) },
        },
      ]);
    });
  });

  test("putFromPath - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "putFromPath").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.putFromPath({ key, path })),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage put attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage put error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("head - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(await CorrelationStorage.run(mocks.correlationId, async () => adapter.head(key))).toEqual({
      exists: false,
    });
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage head attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage head success",
        correlationId: mocks.correlationId,
        metadata: { key, exists: false, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("head - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "head").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () => CorrelationStorage.run(mocks.correlationId, async () => adapter.head(key))).toThrow(
      mocks.IntentionalError,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage head attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage head error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("getStream - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(await CorrelationStorage.run(mocks.correlationId, async () => adapter.getStream(key))).toEqual(
      null,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage get stream attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage get stream success",
        correlationId: mocks.correlationId,
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("getStream - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "getStream").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.getStream(key)),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage get stream attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage get stream error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("delete - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.delete(key)),
    ).not.toThrow();
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage delete attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage delete success",
        correlationId: mocks.correlationId,
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("delete - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "delete").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () => CorrelationStorage.run(mocks.correlationId, async () => adapter.delete(key))).toThrow(
      mocks.IntentionalError,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage delete attempt",
        correlationId: mocks.correlationId,
        metadata: { key },
      },
      {
        component: "infra",
        operation: "remote_file_storage",
        message: "Remote file storage delete error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("get root", () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(adapter.root).toEqual(root);
  });
});
