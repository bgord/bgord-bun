import type * as tools from "@bgord/tools";
import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

export type AntivirusWithTimeoutAdapterDependencies = {
  TimeoutRunner: TimeoutRunnerPort;
  inner: AntivirusPort;
};
export type AntivirusWithTimeoutAdapterConfig = { timeout: tools.Duration };

export class AntivirusWithTimeoutAdapter implements AntivirusPort {
  constructor(
    private readonly config: AntivirusWithTimeoutAdapterConfig,
    private readonly deps: AntivirusWithTimeoutAdapterDependencies,
  ) {}

  async scan(bytes: Uint8Array): Promise<AntivirusScanResult> {
    return this.deps.TimeoutRunner.run(this.deps.inner.scan(bytes), this.config.timeout);
  }
}
