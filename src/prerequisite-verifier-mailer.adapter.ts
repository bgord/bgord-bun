import type { MailerPort } from "./mailer.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

type Dependencies = { Mailer: MailerPort };

export class PrerequisiteVerifierMailerAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly deps: Dependencies) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      await this.deps.Mailer.verify();

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "mailer";
  }
}
