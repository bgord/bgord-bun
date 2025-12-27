import type { LoggerPort } from "./logger.port";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { PrerequisiteVerifierFileAdapter } from "./prerequisite-verifier-file.adapter";

type Dependencies = { Logger: LoggerPort };

export class PrerequisiteVerifierLogFileAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly deps: Dependencies) {}

  async verify() {
    try {
      const path = this.deps.Logger.getFilePath();
      if (!path) return PrerequisiteVerification.undetermined;

      const file = new PrerequisiteVerifierFileAdapter({
        file: path,
        permissions: { read: true, write: true },
      });

      return file.verify();
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "log-file";
  }
}
