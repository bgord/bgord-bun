import type { CertificateInspectorPort } from "./certificate-inspector.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteVerifierSSLCertificateExpiryAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly hostname: string;
  private readonly days: number;

  constructor(
    config: prereqs.PrerequisiteConfigType & { hostname: string; days: number },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;

    this.hostname = config.hostname;
    this.days = config.days;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const result = await this.deps.CertificateInspector.inspect(this.hostname);

    if (!result.success)
      return prereqs.PrerequisiteVerification.failure({ message: "Certificate unavailable" });
    if (result.daysRemaining <= this.days) {
      return prereqs.PrerequisiteVerification.failure({ message: `${result.daysRemaining} days remaining` });
    }
    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "ssl-certificate-expiry";
  }
}
