import type { CertificateInspectorPort } from "../certificate-inspector.port";
import * as prereqs from "../prerequisites.service";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteSSLCertificateExpiry implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly hostname: string;
  private readonly days: number;

  constructor(
    config: prereqs.PrerequisiteConfigType & { hostname: string; days: number },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.hostname = config.hostname;
    this.days = config.days;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const result = await this.deps.CertificateInspector.inspect(this.hostname);

    if (!result.success) return prereqs.Verification.failure({ message: "Certificate unavailable" });
    if (result.daysRemaining <= this.days) {
      return prereqs.Verification.failure({ message: `${result.daysRemaining} days remaining` });
    }
    return prereqs.Verification.success();
  }

  get kind() {
    return "ssl-certificate-expiry";
  }
}
