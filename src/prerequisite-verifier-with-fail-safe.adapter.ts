import {
  PrerequisiteVerification,
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export type PrerequisiteVerifierWithFailSafeAdapterConfigType = (
  result: PrerequisiteVerificationResult,
) => boolean;

const AnyErrorFailSafe: PrerequisiteVerifierWithFailSafeAdapterConfigType = (result) =>
  result.outcome === PrerequisiteVerificationOutcome.failure;

export class PrerequisiteVerifierWithFailSafeAdapter implements PrerequisiteVerifierPort {
  private readonly when: PrerequisiteVerifierWithFailSafeAdapterConfigType;

  constructor(
    private readonly config: {
      inner: PrerequisiteVerifierPort;
      when?: PrerequisiteVerifierWithFailSafeAdapterConfigType;
    },
  ) {
    this.when = config.when ?? AnyErrorFailSafe;
  }

  async verify(): Promise<PrerequisiteVerificationResult> {
    const result = await this.config.inner.verify();

    if (this.when(result)) return PrerequisiteVerification.undetermined;
    return result;
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
