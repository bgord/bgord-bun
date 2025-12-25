import type { CertificateInspectorPort } from "./certificate-inspector.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteVerifierSSLCertificateExpiryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { hostname: string; days: number },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const result = await this.deps.CertificateInspector.inspect(this.config.hostname);

    if (!result.success) return PrerequisiteVerification.failure({ message: "Certificate unavailable" });

    if (result.daysRemaining <= this.config.days) {
      return PrerequisiteVerification.failure({ message: `${result.daysRemaining} days remaining` });
    }

    return PrerequisiteVerification.success;
  }

  get kind() {
    return "ssl-certificate-expiry";
  }
}
