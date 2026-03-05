import type * as tools from "@bgord/tools";
import type { CertificateInspectorPort } from "./certificate-inspector.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

type Config = { hostname: string; minimum: tools.Duration };

export class PrerequisiteVerifierSSLCertificateExpiryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const result = await this.deps.CertificateInspector.inspect(this.config.hostname);

    if (!result.success) return PrerequisiteVerification.failure("Certificate unavailable");
    if (result.remaining.isShorterThan(this.config.minimum) || result.remaining.equals(this.config.minimum)) {
      return PrerequisiteVerification.failure(`${result.remaining.days} days remaining`);
    }
    return PrerequisiteVerification.success;
  }

  get kind(): string {
    return "ssl-certificate-expiry";
  }
}
