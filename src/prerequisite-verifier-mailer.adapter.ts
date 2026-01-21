import type { MailerPort } from "./mailer.port";
import {
  PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { Mailer: MailerPort };

export class PrerequisiteVerifierMailerAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly deps: Dependencies) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      await this.deps.Mailer.verify();

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "mailer";
  }
}
