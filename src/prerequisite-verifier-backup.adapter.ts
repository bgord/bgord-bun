import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { FileInspectionPort } from "./file-inspection.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { Clock: ClockPort; FileInspection: FileInspectionPort };
type Config = { file: tools.FilePathAbsolute | tools.FilePathRelative; maximum: tools.Duration };

export class PrerequisiteVerifierBackupAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const lastModified = await this.deps.FileInspection.lastModified(this.config.file);
      const age = this.deps.Clock.now().difference(lastModified);

      if (age.isLongerThan(this.config.maximum)) {
        return PrerequisiteVerification.failure(`Age: ${age.seconds}s`);
      }
      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "backup";
  }
}
