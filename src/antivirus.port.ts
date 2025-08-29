import type * as tools from "@bgord/tools";

export type AntivirusScanResult = { clean: true } | { clean: false; signature: string };

export class AntivirusScanFailedError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, AntivirusScanFailedError.prototype);
  }
}

export class VirusDetectedError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, VirusDetectedError.prototype);
  }
}

export interface AntivirusPort {
  scanBytes(bytes: Uint8Array, filename?: tools.Filename): Promise<AntivirusScanResult>;
}
