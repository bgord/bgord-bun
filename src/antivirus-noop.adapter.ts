import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";

export class AntivirusNoopAdapter implements AntivirusPort {
  async scan(_bytes: Uint8Array): Promise<AntivirusScanResult> {
    return { clean: true };
  }
}
