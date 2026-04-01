import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";
import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { inner: AntivirusPort; Logger: LoggerPort; Clock: ClockPort };

export class AntivirusWithLoggerAdapter implements AntivirusPort {
  private readonly base = { component: "infra", operation: "antivirus" };

  constructor(private readonly deps: Dependencies) {}

  async scan(bytes: Uint8Array): Promise<AntivirusScanResult> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Antivirus scan attempt",
        metadata: { size: bytes.byteLength },
        ...this.base,
      });

      const result = await this.deps.inner.scan(bytes);

      this.deps.Logger.info({
        message: "Antivirus scan success",
        metadata: { clean: result.clean, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Antivirus scan error",
        error,
        metadata: duration.stop(),
        ...this.base,
      });

      throw error;
    }
  }
}
