import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";
import { Timeout } from "../timeout.service";

export class PrerequisiteOutsideConnectivity implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private static readonly URL = tools.UrlWithoutSlash.parse("https://google.com");
  readonly timeout: tools.Duration;

  constructor(config: prereqs.PrerequisiteConfigType & { timeout?: tools.Duration }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();

      const response = await Timeout.cancellable(
        (signal: AbortSignal) => fetch(PrerequisiteOutsideConnectivity.URL, { method: "HEAD", signal }),
        this.timeout,
      );

      if (response.ok) return prereqs.PrerequisiteVerification.success();
      return prereqs.PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "outside-connectivity";
  }
}
