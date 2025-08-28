import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";

type RemoteFileStorageNoopConfig = { logger: LoggerPort; publicBaseUrl?: string };

export class RemoteFileStorageNoopAdapter implements RemoteFileStoragePort {
  constructor(private readonly config: RemoteFileStorageNoopConfig) {}

  publicUrl(key: tools.ObjectKeyType): string {
    if (!this.config.publicBaseUrl) return `/${key}`;
    return `${this.config.publicBaseUrl}/${key}`;
  }

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    this.config.logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter putFromPath",
      component: "infra",
      operation: "RemoteFileStorageNoopAdapter.putFromPath",
      metadata: { input },
    });

    return {
      etag: "noop",
      size: tools.Size.fromBytes(10),
      lastModified: tools.Timestamp.parse(Date.now()),
      mime: new tools.Mime("text/plain"),
    };
  }

  async head(key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    this.config.logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter head",
      component: "infra",
      operation: "RemoteFileStorageNoopAdapter.head",
      metadata: { key },
    });

    return { exists: false };
  }

  async getStream(key: tools.ObjectKeyType): Promise<ReadableStream | null> {
    this.config.logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter getStream",
      component: "infra",
      operation: "RemoteFileStorageNoopAdapter.getStream",
      metadata: { key },
    });

    return null;
  }

  async delete(key: tools.ObjectKeyType): Promise<void> {
    this.config.logger.info({
      message: "[NOOP] RemoteFileStorageNoopAdapter delete",
      component: "infra",
      operation: "RemoteFileStorageNoopAdapter.delete",
      metadata: { key },
    });
  }
}
