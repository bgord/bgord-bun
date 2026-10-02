import { describe, expect, spyOn, test } from "bun:test";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { DirectoryEnsurerNoopAdapter } from "../src/directory-ensurer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { HashFileNoopAdapter } from "../src/hash-file-noop.adapter";
import { RemoteFileStorageDiskAdapter } from "../src/remote-file-storage-disk.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.remoteFileStorage();

const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const HashFile = new HashFileNoopAdapter();
const FileCleaner = new FileCleanerNoopAdapter();
const FileInspection = new FileInspectionNoopAdapter({ exists: true });
const DirectoryEnsurer = new DirectoryEnsurerNoopAdapter();
const deps = { AtomicFileWriter, HashFile, FileCleaner, FileInspection, DirectoryEnsurer };

const adapter = new RemoteFileStorageDiskAdapter({ root: cases.subjects.root }, deps);
const slashRootAdapter = new RemoteFileStorageDiskAdapter({ root: cases.subjects.slashRoot }, deps);

describe("RemoteFileStorageDiskAdapter", () => {
  test(cases.putFromPath.name, async () => {
    using spies = new DisposableStack();
    // @ts-expect-error Partial access
    spies.use(spyOn(Bun, "file").mockReturnValue(cases.subjects.sourceFile));
    const atomicFileWriterWrite = spies.use(spyOn(AtomicFileWriter, "write"));
    const fileHashHash = spies.use(spyOn(HashFile, "hash").mockResolvedValue(cases.subjects.stored));
    const directoryEnsurerEnsure = spies.use(spyOn(DirectoryEnsurer, "ensure"));

    expect(await adapter.putFromPath(cases.putFromPath.input)).toEqual(cases.putFromPath.output);
    expect(directoryEnsurerEnsure).toHaveBeenCalledWith(cases.subjects.directory);
    expect(atomicFileWriterWrite).toHaveBeenCalledWith(cases.subjects.final, cases.subjects.sourceFile);
    expect(fileHashHash).toHaveBeenCalledWith(cases.subjects.final);
  });

  test(cases.putFromPathFailure.name, async () => {
    using _ = spyOn(AtomicFileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.putFromPath(cases.putFromPathFailure.input)).toThrow(
      cases.putFromPathFailure.output,
    );
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

  test(cases.deleteSlashRoot.name, async () => {
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    expect(await slashRootAdapter.delete(cases.deleteSlashRoot.input)).toEqual(cases.deleteSlashRoot.output);
    expect(fileCleanerDelete).toHaveBeenCalledWith(cases.subjects.slashRootFinal);
  });

  test(cases.deleteRootKey.name, async () => {
    using fileCleanerDelete = spyOn(FileCleaner, "delete");

    expect(await adapter.delete(cases.deleteRootKey.input)).toEqual(cases.deleteRootKey.output);
    expect(fileCleanerDelete).toHaveBeenCalledWith(cases.subjects.rootFinal);
  });
});
