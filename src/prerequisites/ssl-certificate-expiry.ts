import type { CertificateInspectorPort } from "../certificate-inspector.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSSLCertificateExpiry implements prereqs.Prerequisite {
  readonly kind = "ssl-certificate-expiry";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly host: string;
  private readonly validDaysMinimum: number;
  private readonly inspector: CertificateInspectorPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      host: string;
      validDaysMinimum: number;
      inspector: CertificateInspectorPort;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.host = config.host;
    this.validDaysMinimum = config.validDaysMinimum;
    this.inspector = config.inspector;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const result = await this.inspector.inspect(this.host);

    if (!result.success) return prereqs.Verification.failure({ message: "Unavailable" });
    if (result.daysRemaining <= this.validDaysMinimum) {
      return prereqs.Verification.failure({ message: `${result.daysRemaining} days remaining` });
    }
    return prereqs.Verification.success();
  }
}
