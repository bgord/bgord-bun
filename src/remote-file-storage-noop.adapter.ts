import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { Hash } from "./hash.vo";
import type { LoggerPort } from "./logger.port";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

type RemoteFileStorageNoopConfig = { root: tools.DirectoryPathAbsoluteType };

export class RemoteFileStorageNoopAdapter implements RemoteFileStoragePort {
  private readonly base = { component: "infra", operation: "RemoteFileStorageNoopAdapter" };

  constructor(
    private readonly config: RemoteFileStorageNoopConfig,
    private readonly deps: Dependencies,
  ) {}

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    this.deps.Logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter putFromPath",
      metadata: { input },
      ...this.base,
    });

    return {
      etag: Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
      size: tools.Size.fromBytes(10),
      lastModified: this.deps.Clock.now(),
      mime: tools.MIMES.text,
    };
  }

  async head(key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    this.deps.Logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter head",
      metadata: { key },
      ...this.base,
    });

    return { exists: false };
  }

  async getStream(key: tools.ObjectKeyType): Promise<ReadableStream | null> {
    this.deps.Logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter getStream",
      metadata: { key },
      ...this.base,
    });

    return null;
  }

  async delete(key: tools.ObjectKeyType): Promise<void> {
    this.deps.Logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter delete",
      metadata: { key },
      ...this.base,
    });
  }

  get root() {
    return this.config.root;
  }
}
