export type CertificateInspection = { success: true; remaining: number } | { success: false };

export interface CertificateInspectorPort {
  inspect(hostname: string): Promise<CertificateInspection>;
}
