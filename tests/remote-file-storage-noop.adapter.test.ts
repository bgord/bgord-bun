import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";

const root = tools.DirectoryPathAbsoluteSchema.parse("/root");
const key = tools.ObjectKey.parse("users/1/avatar.webp");

const Logger = new LoggerCollectingAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("RemoteFileStorageNoopAdapter", () => {
  test("putFromPath", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock, Logger });
    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(output.etag.matches(mocks.hash)).toEqual(true);
    expect(output.size.toBytes()).toEqual(tools.SizeBytes.parse(10));
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "RemoteFileStorageNoopAdapter",
        message: "[NOOP] RemoteFileStorageNoopAdapter putFromPath",
        metadata: { input: { key, path: input } },
      },
    ]);
  });

  test("head", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock, Logger });

    const result = await adapter.head(key);

    expect(result.exists).toEqual(false);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "RemoteFileStorageNoopAdapter",
        message: "[NOOP] RemoteFileStorageNoopAdapter head",
        metadata: { key },
      },
    ]);
  });

  test("getStream", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock, Logger });

    expect(await adapter.getStream(key)).toEqual(null);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "RemoteFileStorageNoopAdapter",
        message: "[NOOP] RemoteFileStorageNoopAdapter getStream",
        metadata: { key },
      },
    ]);
  });

  test("delete", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock, Logger });

    expect(async () => adapter.delete(key)).not.toThrow();
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "RemoteFileStorageNoopAdapter",
        message: "[NOOP] RemoteFileStorageNoopAdapter delete",
        metadata: { key },
      },
    ]);
  });

  test("get root", () => {
    const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock, Logger });

    expect(adapter.root).toEqual(root);
  });
});
