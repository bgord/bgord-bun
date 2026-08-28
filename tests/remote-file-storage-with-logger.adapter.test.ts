import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import { RemoteFileStorageWithLoggerAdapter } from "../src/remote-file-storage-with-logger.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.remoteFileStorage();

const root = cases.subjects.root;
const key = cases.subjects.key;

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("RemoteFileStorageWithLoggerAdapter", () => {
  test(cases.putFromPath.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const result = await adapter.putFromPath(cases.putFromPath.input);

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

  test(cases.putFromPathFailure.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "putFromPath").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () =>
        adapter.putFromPath(cases.putFromPathFailure.input),
      ),
    ).toThrow(cases.putFromPathFailure.output);
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

  test(cases.headMissing.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(
      await CorrelationStorage.run(mocks.correlationId, async () => adapter.head(cases.headMissing.input)),
    ).toEqual(cases.headMissing.output);
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

  test(cases.headFailure.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "head").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.head(cases.headFailure.input)),
    ).toThrow(cases.headFailure.output);
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

  test(cases.getStreamNull.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(
      await CorrelationStorage.run(mocks.correlationId, async () =>
        adapter.getStream(cases.getStreamNull.input),
      ),
    ).toEqual(cases.getStreamNull.output);
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

  test(cases.getStreamFailure.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "getStream").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () =>
        adapter.getStream(cases.getStreamFailure.input),
      ),
    ).toThrow(cases.getStreamFailure.output);
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

  test(cases.delete.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(await adapter.delete(cases.delete.input)).toEqual(cases.delete.output),
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
        message: "Remote file storage delete success",
        correlationId: mocks.correlationId,
        metadata: { key, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test(cases.deleteFailure.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    using _ = spyOn(inner, "delete").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.delete(cases.deleteFailure.input)),
    ).toThrow(cases.deleteFailure.output);
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

  test(cases.root.name, () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new RemoteFileStorageNoopAdapter({ root }, { Clock });
    const adapter = new RemoteFileStorageWithLoggerAdapter({ inner, Logger, Clock });

    expect(adapter.root).toEqual(cases.root.output);
    expect(Logger.entries).toEqual([]);
  });
});
