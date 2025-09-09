import sslChecker from "ssl-checker";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSSLCertificateExpiry implements prereqs.Prerequisite {
  readonly kind = "ssl-certificate-expiry";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly host: string;
  private readonly validDaysMinimum: number;

  constructor(config: prereqs.PrerequisiteConfigType & { host: string; validDaysMinimum: number }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.host = config.host;
    this.validDaysMinimum = config.validDaysMinimum;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const result = await sslChecker(this.host);

      if (!result.valid) return prereqs.Verification.failure({ message: "Invalid" });
      if (result.daysRemaining <= this.validDaysMinimum) {
        return prereqs.Verification.failure({ message: `Days remaining: ${result.daysRemaining}` });
      }
      return prereqs.Verification.success();
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
