import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";

const root = v.parse(tools.DirectoryPathAbsoluteSchema, "/root");
const key = v.parse(tools.ObjectKey, "users/1/avatar.webp");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const adapter = new RemoteFileStorageNoopAdapter({ root }, { Clock });

describe("RemoteFileStorageNoopAdapter", () => {
  test("putFromPath", async () => {
    const input = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");

    const output = await adapter.putFromPath({ key, path: input });

    expect(output.etag.matches(mocks.hash)).toEqual(true);
    expect(output.size.toBytes()).toEqual(v.parse(tools.SizeBytes, 10));
    expect(output.lastModified).toEqual(mocks.TIME_ZERO);
  });

  test("head", async () => {
    const result = await adapter.head(key);

    expect(result.exists).toEqual(false);
  });

  test("getStream", async () => {
    expect(await adapter.getStream(key)).toEqual(null);
  });

  test("delete", async () => {
    expect(await adapter.delete(key)).toEqual(key);
  });

  test("get root", () => {
    expect(adapter.root).toEqual(root);
  });
});
