import * as tools from "@bgord/tools";
import type { MailerPort } from "./mailer.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import { Timeout } from "./timeout.service";

type Dependencies = { Mailer: MailerPort };

export class PrerequisiteVerifierMailerAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { timeout?: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const timeout = this.config.timeout ?? tools.Duration.Seconds(2);

    try {
      await Timeout.run(this.deps.Mailer.verify(), timeout);
      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "mailer";
  }
}
