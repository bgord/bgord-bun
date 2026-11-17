import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierTimezoneUtcAdapter implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone === "UTC") return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Timezone: ${timezone}`);
  }

  get kind(): string {
    return "timezone-utc";
  }
}
