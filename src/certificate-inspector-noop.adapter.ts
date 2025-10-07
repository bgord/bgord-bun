import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";

export class CertificateInspectorNoopAdapter implements CertificateInspectorPort {
  constructor(private readonly daysRemaining: number) {}

  async inspect(_hostname: string): Promise<CertificateInspection> {
    return { success: true, daysRemaining: this.daysRemaining };
  }
}
