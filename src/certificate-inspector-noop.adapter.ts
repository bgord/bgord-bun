import type * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";

export class CertificateInspectorNoopAdapter implements CertificateInspectorPort {
  constructor(private readonly remaining: tools.Duration) {}

  async inspect(_hostname: string): Promise<CertificateInspection> {
    return { success: true, remaining: this.remaining };
  }
}
