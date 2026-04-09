import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { DirectoryEnsurerPort } from "./directory-ensurer.port";
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

type Dependencies = {
  HashFile: HashFilePort;
  FileCleaner: FileCleanerPort;
  FileRenamer: FileRenamerPort;
  FileCopier: FileCopierPort;
  DirectoryEnsurer: DirectoryEnsurerPort;
};

type Config = { root: tools.DirectoryPathAbsoluteType };

export class RemoteFileStorageDiskAdapter implements RemoteFileStoragePort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  private resolveKeyToAbsoluteFilePath(key: tools.ObjectKeyType): tools.FilePathAbsolute {
    const parts = key.split("/");
    const filename = tools.Filename.fromString(parts.pop() as string);

    const directory = v.parse(tools.DirectoryPathAbsoluteSchema, `${this.config.root}/${parts.join("/")}`);

    return tools.FilePathAbsolute.fromPartsSafe(directory, filename);
  }

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    const final = this.resolveKeyToAbsoluteFilePath(input.key);
    const temporary = final.withFilename(final.getFilename().withSuffix("-part"));

    await this.deps.DirectoryEnsurer.ensure(final.getDirectory());
    await this.deps.FileCopier.copy(input.path, temporary);

    try {
      await this.deps.FileRenamer.rename(temporary, final);
    } catch (error) {
      await this.deps.FileCleaner.delete(temporary);
      throw error;
    }

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

  async delete(key: tools.ObjectKeyType): Promise<tools.ObjectKeyType> {
    await this.deps.FileCleaner.delete(this.resolveKeyToAbsoluteFilePath(key));

    return key;
  }

  get root(): tools.DirectoryPathAbsoluteType {
    return this.config.root;
  }
}
