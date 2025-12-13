import * as tools from "@bgord/tools";
import type { CertificateInspectorPort } from "../certificate-inspector.port";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

type Dependencies = { CertificateInspector: CertificateInspectorPort };

export class PrerequisiteSSLCertificateExpiry implements prereqs.Prerequisite {
  readonly kind = "ssl-certificate-expiry";
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

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const result = await this.deps.CertificateInspector.inspect(this.hostname);

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
