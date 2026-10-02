import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AtomicFileWriterAdapter } from "../src/atomic-file-writer.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import * as mocks from "./mocks";

const content = new TextEncoder().encode("hello");
const absolute = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
const absoluteTemporary = tools.FilePathAbsolute.fromString(`/var/img/photo-part-${mocks.nonce}.webp`);
const relative = tools.FilePathRelative.fromString("var/img/photo.webp");
const relativeTemporary = tools.FilePathRelative.fromString(`var/img/photo-part-${mocks.nonce}.webp`);

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const NonceProvider = new NonceProviderDeterministicAdapter(tools.repeat(mocks.nonce, 10));
const deps = { FileCleaner, FileRenamer, FileWriter, NonceProvider };

const adapter = new AtomicFileWriterAdapter(deps);

describe("AtomicFileWriterAdapter", () => {
  test("write - absolute", async () => {
    using spies = new DisposableStack();
    const fileWriterWrite = spies.use(spyOn(FileWriter, "write"));
    const fileRenamerRename = spies.use(spyOn(FileRenamer, "rename"));
    const fileCleanerDelete = spies.use(spyOn(FileCleaner, "delete"));

    await adapter.write(absolute, content);

    expect(fileWriterWrite).toHaveBeenCalledWith(absoluteTemporary.get(), content);
    expect(fileRenamerRename).toHaveBeenCalledWith(absoluteTemporary, absolute);
    expect(fileCleanerDelete).not.toHaveBeenCalled();
  });

  test("write - relative", async () => {
    using spies = new DisposableStack();
    const fileWriterWrite = spies.use(spyOn(FileWriter, "write"));
    const fileRenamerRename = spies.use(spyOn(FileRenamer, "rename"));

    await adapter.write(relative, content);

    expect(fileWriterWrite).toHaveBeenCalledWith(relativeTemporary.get(), content);
    expect(fileRenamerRename).toHaveBeenCalledWith(relativeTemporary, relative);
  });

  test("write - write error", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(FileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync));
    const fileRenamerRename = spies.use(spyOn(FileRenamer, "rename"));
    const fileCleanerDelete = spies.use(spyOn(FileCleaner, "delete"));

    expect(async () => adapter.write(absolute, content)).toThrow(mocks.IntentionalError);
    expect(fileRenamerRename).not.toHaveBeenCalled();
    expect(fileCleanerDelete).toHaveBeenCalledWith(absoluteTemporary);
  });

  test("write - rename error", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(FileRenamer, "rename").mockImplementation(mocks.throwIntentionalErrorAsync));
    const fileCleanerDelete = spies.use(spyOn(FileCleaner, "delete"));

    expect(async () => adapter.write(absolute, content)).toThrow(mocks.IntentionalError);
    expect(fileCleanerDelete).toHaveBeenCalledWith(absoluteTemporary);
  });

  test("write - cleanup error keeps original error", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(FileRenamer, "rename").mockImplementation(mocks.throwIntentionalErrorAsync));
    spies.use(spyOn(FileCleaner, "delete").mockRejectedValue(new Error("cleanup")));

    expect(async () => adapter.write(absolute, content)).toThrow(mocks.IntentionalError);
  });
});
