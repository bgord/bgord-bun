import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteOutsideConnectivity implements prereqs.Prerequisite {
  readonly kind = "outside-connectivity";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly url = "https://google.com";

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    try {
      if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

      const response = await fetch(this.url, { method: "HEAD" });

      if (response.ok) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
