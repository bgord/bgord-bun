import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import type { SmsPort } from "./sms.port";

type Dependencies = { Sms: SmsPort };

export class PrerequisiteVerifierSmsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly deps: Dependencies) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      await this.deps.Sms.verify();

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "sms";
  }
}
