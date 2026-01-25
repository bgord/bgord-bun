import type * as tools from "@bgord/tools";

export type AntivirusScanResult = { clean: true } | { clean: false; signature: string };

export const AntivirusPortError = { ScanFailed: "antivirus.scan.failed" };

export interface AntivirusPort {
  scan(bytes: Uint8Array, filename?: tools.Filename): Promise<AntivirusScanResult>;
}
