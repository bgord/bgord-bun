import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import { Timeout } from "./timeout.service";

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly request: (signal: AbortSignal) => Promise<Response>;
  readonly timeout: tools.Duration;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      request: (signal: AbortSignal) => Promise<Response>;
      timeout?: tools.Duration;
    },
  ) {
    this.label = config.label;

    this.request = config.request;
    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const response = await Timeout.cancellable((signal: AbortSignal) => this.request(signal), this.timeout);

      if (response.ok) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "external-api";
  }
}
