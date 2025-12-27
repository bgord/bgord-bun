import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export type PrerequisiteVerifierWithFailSafeAdapterConfigType = (
  result: PrerequisiteVerificationResult,
) => boolean;

export class PrerequisiteVerifierWithFailSafeAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      inner: PrerequisiteVerifierPort;
      when: PrerequisiteVerifierWithFailSafeAdapterConfigType;
    },
  ) {}

  async verify() {
    const result = await this.config.inner.verify();

    if (this.config.when(result)) return PrerequisiteVerification.undetermined;
    return result;
  }

  get kind() {
    return this.config.inner.kind;
  }
}
