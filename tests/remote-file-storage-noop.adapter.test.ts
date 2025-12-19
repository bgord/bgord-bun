import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";

const root = tools.DirectoryPathAbsoluteSchema.parse("/root");
const key = tools.ObjectKey.parse("users/1/avatar.webp");

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, Logger };
const adapter = new RemoteFileStorageNoopAdapter({ root }, deps);

describe("RemoteFileStorageNoopAdapter", () => {
  test("putFromPath", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(output.etag.matches(mocks.hash)).toEqual(true);
    expect(output.size.toBytes()).toEqual(tools.SizeBytes.parse(10));
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("head", async () => {
    const loggerInfo = spyOn(Logger, "info");

    const result = await adapter.head(key);

    expect(result.exists).toEqual(false);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("getStream", async () => {
    const loggerInfo = spyOn(Logger, "info");

    expect(await adapter.getStream(key)).toEqual(null);
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("delete", async () => {
    const loggerInfo = spyOn(Logger, "info");

    expect(async () => adapter.delete(key)).not.toThrow();
    expect(loggerInfo).toHaveBeenCalled();
  });

  test("get root", () => {
    expect(adapter.root).toEqual(root);
  });
});
