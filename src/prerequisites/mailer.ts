import * as tools from "@bgord/tools";
import type { MailerPort } from "../mailer.port";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";
import { Timeout } from "../timeout.service";

type Dependencies = { Mailer: MailerPort };

export class PrerequisiteMailer implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  readonly timeout: tools.Duration;

  constructor(
    config: prereqs.PrerequisiteConfigType & { timeout?: tools.Duration },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;

    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      await Timeout.run(this.deps.Mailer.verify(), this.timeout);
      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "mailer";
  }
}
