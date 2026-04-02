import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type {
  RemoteFileStoragePort,
  RemoteHeadResult,
  RemotePutFromPathInput,
  RemotePutFromPathResult,
} from "./remote-file-storage.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { inner: RemoteFileStoragePort; Logger: LoggerPort; Clock: ClockPort };

export class RemoteFileStorageWithLoggerAdapter implements RemoteFileStoragePort {
  private readonly base = { component: "infra", operation: "remote_file_storage" };

  constructor(private readonly deps: Dependencies) {}

  async putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Remote file storage put attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { key: input.key },
        ...this.base,
      });

      const result = await this.deps.inner.putFromPath(input);

      this.deps.Logger.info({
        message: "Remote file storage put success",
        correlationId: CorrelationStorage.get(),
        metadata: { key: input.key, size: result.size, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Remote file storage put error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { key: input.key, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async head(key: tools.ObjectKeyType): Promise<RemoteHeadResult> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Remote file storage head attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { key },
        ...this.base,
      });

      const result = await this.deps.inner.head(key);

      this.deps.Logger.info({
        message: "Remote file storage head success",
        correlationId: CorrelationStorage.get(),
        metadata: { key, exists: result.exists, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Remote file storage head error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { key, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async getStream(key: tools.ObjectKeyType): Promise<ReadableStream | null> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Remote file storage get stream attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { key },
        ...this.base,
      });

      const result = await this.deps.inner.getStream(key);

      this.deps.Logger.info({
        message: "Remote file storage get stream success",
        correlationId: CorrelationStorage.get(),
        metadata: { key, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Remote file storage get stream error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { key, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async delete(key: tools.ObjectKeyType): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Remote file storage delete attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { key },
        ...this.base,
      });

      await this.deps.inner.delete(key);

      this.deps.Logger.info({
        message: "Remote file storage delete success",
        correlationId: CorrelationStorage.get(),
        metadata: { key, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Remote file storage delete error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { key, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  get root(): tools.DirectoryPathAbsoluteType {
    return this.deps.inner.root;
  }
}
