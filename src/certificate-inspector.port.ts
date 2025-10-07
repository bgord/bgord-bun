export type CertificateInspection = { success: true; daysRemaining: number } | { success: false };

export interface CertificateInspectorPort {
  inspect(hostname: string): Promise<CertificateInspection>;
}
