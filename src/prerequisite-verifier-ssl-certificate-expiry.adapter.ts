import type { CertificateInspectorPort } from "./certificate-inspector.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteVerifierSSLCertificateExpiryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { hostname: string; days: number },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const result = await this.deps.CertificateInspector.inspect(this.config.hostname);

    if (!result.success) {
      return prereqs.PrerequisiteVerification.failure({ message: "Certificate unavailable" });
    }

    if (result.daysRemaining <= this.config.days) {
      return prereqs.PrerequisiteVerification.failure({ message: `${result.daysRemaining} days remaining` });
    }

    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "ssl-certificate-expiry";
  }
}
