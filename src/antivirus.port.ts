export type AntivirusScanResult = { clean: true } | { clean: false; signature: string };

export const AntivirusPortError = { ScanFailed: "antivirus.scan.failed" };

export interface AntivirusPort {
  scan(bytes: Uint8Array): Promise<AntivirusScanResult>;
}
