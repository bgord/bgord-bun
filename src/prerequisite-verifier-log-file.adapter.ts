import type { LoggerPort } from "./logger.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { PrerequisiteVerifierFileAdapter } from "./prerequisite-verifier-file.adapter";
import * as prereqs from "./prerequisites.service";

type Dependencies = { Logger: LoggerPort };

export class PrerequisiteVerifierLogFileAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  constructor(
    config: prereqs.PrerequisiteConfigType,
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const path = this.deps.Logger.getFilePath();
      if (!path) return prereqs.PrerequisiteVerification.undetermined;

      const file = new PrerequisiteVerifierFileAdapter({
        label: this.label,
        file: path,
        permissions: { read: true, write: true },
      });

      return file.verify();
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "log-file";
  }
}
