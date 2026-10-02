import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { TemporaryFileAbsoluteAdapter } from "../src/temporary-file-absolute.adapter";
import * as mocks from "./mocks";

const content = new File([new TextEncoder().encode("hello")], "ignored.bin", {
  type: "application/octet-stream",
});
const directory = v.parse(tools.DirectoryPathAbsoluteSchema, "/tmp/bgord-tests");
const filename = tools.Filename.fromString("avatar.webp");
const final = tools.FilePathAbsolute.fromPartsSafe(directory, filename);

const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const FileCleaner = new FileCleanerNoopAdapter();
const deps = { AtomicFileWriter, FileCleaner };

const adapter = new TemporaryFileAbsoluteAdapter(directory, deps);

describe("TemporaryFileAbsoluteAdapter", () => {
  test("write", async () => {
    using atomicFileWriterWrite = spyOn(AtomicFileWriter, "write");

    const path = await adapter.write(filename, content);

    expect(atomicFileWriterWrite).toHaveBeenCalledWith(final, content);
    expect(path).toEqual(final);
  });

  test("write - error", async () => {
    using _ = spyOn(AtomicFileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.write(filename, content)).toThrow(mocks.IntentionalError);
  });

  test("cleanup", async () => {
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    await adapter.cleanup(filename);

    expect(fileCleanerDelete).toHaveBeenCalledWith(final);
  });

  test("get root", () => {
    expect(adapter.root).toEqual(directory);
  });
});
