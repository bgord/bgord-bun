import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import { Timeout } from "./timeout.service";

export class PrerequisiteVerifierOutsideConnectivityAdapter implements PrerequisiteVerifierPort {
  private static readonly URL = tools.UrlWithoutSlash.parse("https://google.com");

  constructor(private readonly config: { timeout?: tools.Duration }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const timeout = this.config.timeout ?? tools.Duration.Seconds(2);

    try {
      const response = await Timeout.cancellable(
        (signal: AbortSignal) =>
          fetch(PrerequisiteVerifierOutsideConnectivityAdapter.URL, { method: "HEAD", signal }),
        timeout,
      );

      if (response.ok) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "outside-connectivity";
  }
}
