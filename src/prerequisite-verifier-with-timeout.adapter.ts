import type * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

type Dependencies = { TimeoutRunner: TimeoutRunnerPort };

export class PrerequisiteVerifierWithTimeoutAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { inner: PrerequisiteVerifierPort; timeout: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      return await this.deps.TimeoutRunner.run<PrerequisiteVerificationResult>(
        this.config.inner.verify(),
        this.config.timeout,
      );
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
