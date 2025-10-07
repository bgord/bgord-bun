import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";

export class CertificateInspectorNoopAdapter implements CertificateInspectorPort {
  async inspect(_hostname: string): Promise<CertificateInspection> {
    return { success: true, daysRemaining: 7 };
  }
}
