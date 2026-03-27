import type { CronSchedulerPort } from "./cron-scheduler.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { CronScheduler: CronSchedulerPort };

export class PrerequisiteVerifierCronSchedulerAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly deps: Dependencies) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    if (await this.deps.CronScheduler.verify()) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure();
  }

  get kind(): string {
    return "cron-scheduler";
  }
}
