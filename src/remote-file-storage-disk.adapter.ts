import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { FileHashPort } from "./file-hash.port";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";

type RemoteFileStorageDiskConfig = {
  root: tools.DirectoryPathAbsoluteType;
  hasher: FileHashPort;
  publicBaseUrl?: string;
};

export class RemoteFileStorageDiskAdapter implements RemoteFileStoragePort {
  constructor(private readonly config: RemoteFileStorageDiskConfig) {}

  private resolveKeyToAbsoluteFilePath(key: tools.ObjectKeyType): tools.FilePathAbsolute {
    const parts = key.split("/");
    const filename = tools.Filename.fromString(parts.pop()!);

    const directory = tools.DirectoryPathAbsoluteSchema.parse(`${this.config.root}/${parts.join("/")}`);

    return tools.FilePathAbsolute.fromPartsSafe(directory, filename);
  }

  publicUrl(key: tools.ObjectKeyType): string {
    if (!this.config.publicBaseUrl) return `/${key}`;
    return `${this.config.publicBaseUrl}/${key}`;
  }

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    const final = this.resolveKeyToAbsoluteFilePath(input.key);
    const temporary = final.withFilename(final.getFilename().withSuffix("-part"));

    await fs.mkdir(final.getDirectory(), { recursive: true });

    const source = Bun.file(input.path.get());
    await Bun.write(temporary.get(), source);
    await fs.rename(temporary.get(), final.get());

    return this.config.hasher.hash(final);
  }

  async head(key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    const path = this.resolveKeyToAbsoluteFilePath(key);

    try {
      return { exists: true, ...(await this.config.hasher.hash(path)) };
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
    const path = this.resolveKeyToAbsoluteFilePath(key);

    try {
      await fs.unlink(path.get());
    } catch (error) {}
  }
}
