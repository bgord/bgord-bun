import * as tools from "@bgord/tools";
import type { CertificateInspectorPort } from "../certificate-inspector.port";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSSLCertificateExpiry implements prereqs.Prerequisite {
  readonly kind = "ssl-certificate-expiry";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly host: string;
  private readonly days: number;
  private readonly inspector: CertificateInspectorPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      host: string;
      days: number;
      inspector: CertificateInspectorPort;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.host = config.host;
    this.days = config.days;
    this.inspector = config.inspector;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const result = await this.inspector.inspect(this.host);

    if (!result.success)
      return prereqs.Verification.failure(stopwatch.stop(), { message: "Certificate unavailable" });
    if (result.daysRemaining <= this.days) {
      return prereqs.Verification.failure(stopwatch.stop(), {
        message: `${result.daysRemaining} days remaining`,
      });
    }
    return prereqs.Verification.success(stopwatch.stop());
  }
}
