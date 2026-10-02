import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AtomicFileWriterCollectingAdapter } from "../src/atomic-file-writer-collecting.adapter";

const path = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
const adapter = new AtomicFileWriterCollectingAdapter();

describe("AtomicFileWriterCollectingAdapter", () => {
  test("write", async () => {
    await adapter.write(path, "hello");

    expect(adapter.written).toEqual([[path, "hello"]]);
  });
});
