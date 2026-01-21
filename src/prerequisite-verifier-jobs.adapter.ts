import { Jobs, type MultipleJobsType } from "./jobs.service";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierJobsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { Jobs: MultipleJobsType }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    if (Jobs.areAllRunning(this.config.Jobs)) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure();
  }

  get kind(): string {
    return "jobs";
  }
}
