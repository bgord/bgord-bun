import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";

const path = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
const adapter = new AtomicFileWriterNoopAdapter();

describe("AtomicFileWriterNoopAdapter", () => {
  test("write", async () => {
    expect(await adapter.write(path, "hello")).toEqual(undefined);
  });
});
