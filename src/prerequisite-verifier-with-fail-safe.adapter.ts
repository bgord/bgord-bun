import {
  PrerequisiteVerification,
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export type PrerequisiteVerifierWithFailSafeAdapterConfig = (
  result: PrerequisiteVerificationResult,
) => boolean;

const AnyErrorFailSafe: PrerequisiteVerifierWithFailSafeAdapterConfig = (result) =>
  result.outcome === PrerequisiteVerificationOutcome.failure;

export class PrerequisiteVerifierWithFailSafeAdapter implements PrerequisiteVerifierPort {
  private readonly when: PrerequisiteVerifierWithFailSafeAdapterConfig;

  constructor(
    private readonly config: {
      inner: PrerequisiteVerifierPort;
      when?: PrerequisiteVerifierWithFailSafeAdapterConfig;
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
