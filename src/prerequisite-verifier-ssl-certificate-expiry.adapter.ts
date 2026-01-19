import type * as tools from "@bgord/tools";
import type { CertificateInspectorPort } from "./certificate-inspector.port";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteVerifierSSLCertificateExpiryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { hostname: string; minimum: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    const result = await this.deps.CertificateInspector.inspect(this.config.hostname);

    if (!result.success) return PrerequisiteVerification.failure("Certificate unavailable");
    if (result.remaining.isShorterThan(this.config.minimum) || result.remaining.equals(this.config.minimum)) {
      return PrerequisiteVerification.failure(`${result.remaining.days} days remaining`);
    }
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "ssl-certificate-expiry";
  }
}
