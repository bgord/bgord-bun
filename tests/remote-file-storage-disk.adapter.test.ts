import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { DirectoryEnsurerNoopAdapter } from "../src/directory-ensurer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileCopierNoopAdapter } from "../src/file-copier-noop.adapter";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { HashFileNoopAdapter } from "../src/hash-file-noop.adapter";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.remoteFileStorage();

const HashFile = new HashFileNoopAdapter();
const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileCopier = new FileCopierNoopAdapter();
const FileInspection = new FileInspectionNoopAdapter({ exists: true });
const DirectoryEnsurer = new DirectoryEnsurerNoopAdapter();
const NonceProvider = new NonceProviderDeterministicAdapter(tools.repeat(mocks.nonce, 10));
const deps = {
  HashFile,
  FileCleaner,
  FileRenamer,
  FileCopier,
  FileInspection,
  DirectoryEnsurer,
  NonceProvider,
};

const adapter = new RemoteFileStorageDiskAdapter({ root: cases.subjects.root }, deps);

describe("RemoteFileStorageDiskAdapter", () => {
  test(cases.putFromPath.name, async () => {
    using fileCopierCopy = spyOn(FileCopier, "copy");
    using fileHashHash = spyOn(HashFile, "hash").mockResolvedValue(cases.subjects.stored);
    using directoryEnsurerEnsure = spyOn(DirectoryEnsurer, "ensure");
    using fileRenamerRename = spyOn(FileRenamer, "rename");

    expect(await adapter.putFromPath(cases.putFromPath.input)).toEqual(cases.putFromPath.output);
    expect(directoryEnsurerEnsure).toHaveBeenCalledWith(cases.subjects.directory);
    expect(fileCopierCopy).toHaveBeenCalledWith(cases.subjects.source, cases.subjects.temporary);
    expect(fileRenamerRename).toHaveBeenCalledWith(cases.subjects.temporary, cases.subjects.final);
    expect(fileHashHash).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.putFromPathFailure.name, async () => {
    using _ = spyOn(FileRenamer, "rename").mockImplementation(mocks.throwIntentionalErrorAsync);
    using __ = spyOn(FileCopier, "copy");
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    expect(async () => adapter.putFromPath(cases.putFromPathFailure.input)).toThrow(
      cases.putFromPathFailure.output,
    );
    expect(fileCleanerDelete).toHaveBeenCalledWith(cases.subjects.temporary);
  });

  test(cases.head.name, async () => {
    using fileHashHash = spyOn(HashFile, "hash").mockResolvedValue(cases.subjects.stored);

    expect(await adapter.head(cases.head.input)).toEqual(cases.head.output);
    expect(fileHashHash).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.headMissing.name, async () => {
    using fileHashHash = spyOn(HashFile, "hash").mockRejectedValue(cases.headFailure.output);

    expect(await adapter.head(cases.headMissing.input)).toEqual(cases.headMissing.output);
    expect(fileHashHash).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.getStream.name, async () => {
    using fileInspectionExists = spyOn(FileInspection, "exists").mockResolvedValue(true);
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockImplementation(() => ({ stream: () => cases.subjects.stream }));

    expect(await adapter.getStream(cases.getStream.input)).toEqual(cases.getStream.output);
    expect(fileInspectionExists).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.getStreamNull.name, async () => {
    using fileInspectionExists = spyOn(FileInspection, "exists").mockResolvedValue(false);

    expect(await adapter.getStream(cases.getStreamNull.input)).toEqual(cases.getStreamNull.output);
    expect(fileInspectionExists).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.getStreamFailure.name, async () => {
    using _ = spyOn(FileInspection, "exists").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.getStream(cases.getStreamFailure.input)).toThrow(
      cases.getStreamFailure.output,
    );
  });

  test(cases.delete.name, async () => {
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    expect(await adapter.delete(cases.delete.input)).toEqual(cases.delete.output);
    expect(fileCleanerDelete).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.deleteFailure.name, async () => {
    using _ = spyOn(FileCleaner, "delete").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.delete(cases.deleteFailure.input)).toThrow(cases.deleteFailure.output);
  });

  test(cases.root.name, () => {
    expect(adapter.root).toEqual(cases.root.output);
  });
});
