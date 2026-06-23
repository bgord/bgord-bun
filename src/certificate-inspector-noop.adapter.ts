import type * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";
import type { HostnameType } from "./hostname.vo";

export class CertificateInspectorNoopAdapter implements CertificateInspectorPort {
  constructor(private readonly remaining: tools.Duration) {}

  async inspect(_hostname: HostnameType): Promise<CertificateInspection> {
    return { success: true, remaining: this.remaining };
  }
}
