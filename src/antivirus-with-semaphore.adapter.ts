import type * as tools from "@bgord/tools";
import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: AntivirusPort; semaphore: Semaphore };

export class AntivirusWithSemaphoreAdapter implements AntivirusPort {
  constructor(private readonly deps: Dependencies) {}

  async scan(bytes: Uint8Array, filename?: tools.Filename): Promise<AntivirusScanResult> {
    return this.deps.semaphore.run(() => this.deps.inner.scan(bytes, filename));
  }
}
