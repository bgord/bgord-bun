import type * as tools from "@bgord/tools";
import type { HostnameType } from "./hostname.vo";

export type CertificateInspection = { success: true; remaining: tools.Duration } | { success: false };

export interface CertificateInspectorPort {
  inspect(hostname: HostnameType): Promise<CertificateInspection>;
}
