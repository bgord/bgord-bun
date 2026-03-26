import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { Hash } from "./hash.vo";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";

type Dependencies = { Clock: ClockPort };

type RemoteFileStorageNoopConfig = { root: tools.DirectoryPathAbsoluteType };

export class RemoteFileStorageNoopAdapter implements RemoteFileStoragePort {
  constructor(
    private readonly config: RemoteFileStorageNoopConfig,
    private readonly deps: Dependencies,
  ) {}

  async putFromPath(_input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    return {
      etag: Hash.fromString("0".repeat(64)),
      size: tools.Size.fromBytes(10),
      lastModified: this.deps.Clock.now(),
      mime: tools.Mimes.text.mime,
    };
  }

  async head(_key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    return { exists: false };
  }

  async getStream(_key: tools.ObjectKeyType): Promise<ReadableStream | null> {
    return null;
  }

  async delete(_key: tools.ObjectKeyType): Promise<void> {}

  get root(): tools.DirectoryPathAbsoluteType {
    return this.config.root;
  }
}
