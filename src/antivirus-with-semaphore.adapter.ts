import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";
import type { Semaphore } from "./semaphore.service";

export type AntivirusWithSemaphoreAdapterDependencies = { inner: AntivirusPort; semaphore: Semaphore };

export class AntivirusWithSemaphoreAdapter implements AntivirusPort {
  constructor(private readonly deps: AntivirusWithSemaphoreAdapterDependencies) {}

  async scan(bytes: Uint8Array): Promise<AntivirusScanResult> {
    return this.deps.semaphore.run(() => this.deps.inner.scan(bytes));
  }
}
