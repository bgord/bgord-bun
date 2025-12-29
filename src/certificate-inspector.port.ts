import type * as tools from "@bgord/tools";

export type CertificateInspection = { success: true; remaining: tools.Duration } | { success: false };

export interface CertificateInspectorPort {
  inspect(hostname: string): Promise<CertificateInspection>;
}
