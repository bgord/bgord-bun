import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";
import { Timeout } from "../timeout.service";

export class PrerequisiteOutsideConnectivity implements prereqs.Prerequisite {
  readonly kind = "outside-connectivity";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly url = "https://google.com";
  readonly timeout: tools.Duration;

  constructor(config: prereqs.PrerequisiteConfigType & { timeout?: tools.Duration }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    try {
      if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

      const response = await Timeout.cancellable(
        (signal: AbortSignal) => fetch(this.url, { method: "HEAD", signal }),
        this.timeout,
      );

      if (response.ok) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop(), { message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
