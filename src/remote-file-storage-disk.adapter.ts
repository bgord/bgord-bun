import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileCopierPort } from "./file-copier.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { HashFilePort } from "./hash-file.port";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";

type RemoteFileStorageDiskConfig = { root: tools.DirectoryPathAbsoluteType };

type Dependencies = {
  HashFile: HashFilePort;
  FileCleaner: FileCleanerPort;
  FileRenamer: FileRenamerPort;
  FileCopier: FileCopierPort;
};

export class RemoteFileStorageDiskAdapter implements RemoteFileStoragePort {
  constructor(
    private readonly config: RemoteFileStorageDiskConfig,
    private readonly deps: Dependencies,
  ) {}

  private resolveKeyToAbsoluteFilePath(key: tools.ObjectKeyType): tools.FilePathAbsolute {
    const parts = key.split("/");
    const filename = tools.Filename.fromString(parts.pop() as string);

    const directory = tools.DirectoryPathAbsoluteSchema.parse(`${this.config.root}/${parts.join("/")}`);

    return tools.FilePathAbsolute.fromPartsSafe(directory, filename);
  }

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    const final = this.resolveKeyToAbsoluteFilePath(input.key);
    const temporary = final.withFilename(final.getFilename().withSuffix("-part"));

    await fs.mkdir(final.getDirectory(), { recursive: true });

    await this.deps.FileCopier.copy(input.path, temporary);
    await this.deps.FileRenamer.rename(temporary, final);

    return this.deps.HashFile.hash(final);
  }

  async head(key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    const path = this.resolveKeyToAbsoluteFilePath(key);

    try {
      return { exists: true, ...(await this.deps.HashFile.hash(path)) };
    } catch {
      return { exists: false };
    }
  }

  async getStream(key: tools.ObjectKeyType): Promise<ReadableStream | null> {
    const path = this.resolveKeyToAbsoluteFilePath(key);

    try {
      return Bun.file(path.get()).stream();
    } catch {
      return null;
    }
  }

  async delete(key: tools.ObjectKeyType): Promise<void> {
    await this.deps.FileCleaner.delete(this.resolveKeyToAbsoluteFilePath(key));
  }

  get root(): tools.DirectoryPathAbsoluteType {
    return this.config.root;
  }
}
