import type * as tools from "@bgord/tools";
import type { AntivirusPort, AntivirusScanResult } from "./antivirus.port";

export class AntivirusNoopAdapter implements AntivirusPort {
  async scanBytes(_bytes: Uint8Array, _filename?: tools.Filename): Promise<AntivirusScanResult> {
    return { clean: true };
  }
}
