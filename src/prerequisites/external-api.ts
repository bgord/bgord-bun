import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteExternalApi implements prereqs.Prerequisite {
  readonly kind = "external-api";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly request: () => Promise<Response>;

  constructor(config: prereqs.PrerequisiteConfigType & { request: () => Promise<Response> }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.request = config.request;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const response = await this.request();

      if (response.ok) return prereqs.Verification.success();
      return prereqs.Verification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
