import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { FileInspection: FileInspectionPort };

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierFileAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      file: tools.FilePathAbsolute | tools.FilePathRelative;
      permissions?: PrerequisiteFilePermissionsType;
    },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const exists = await this.deps.FileInspection.exists(this.config.file);

      if (!exists) return PrerequisiteVerification.failure("File does not exist");

      const permissions = this.config.permissions ?? {};

      if (permissions.read && !(await this.deps.FileInspection.canRead(this.config.file))) {
        return PrerequisiteVerification.failure("File is not readable");
      }

      if (permissions.write && !(await this.deps.FileInspection.canWrite(this.config.file))) {
        return PrerequisiteVerification.failure("File is not writable");
      }

      if (permissions.execute && !(await this.deps.FileInspection.canExecute(this.config.file))) {
        return PrerequisiteVerification.failure("File is not executable");
      }

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "file";
  }
}
