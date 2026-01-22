import { stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "../src/file-inspection.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { FileInspection: FileInspectionPort };

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierDirectoryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      permissions?: PrerequisiteDirectoryPermissionsType;
    },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const node = await stat(this.config.directory);

      if (!node.isDirectory()) return PrerequisiteVerification.failure("Not a directory");
    } catch {
      return PrerequisiteVerification.failure("Directory does not exist");
    }

    const permissions = this.config.permissions ?? {};

    if (permissions.read && !(await this.deps.FileInspection.canRead(this.config.directory))) {
      return PrerequisiteVerification.failure("Directory is not readable");
    }

    if (permissions.write && !(await this.deps.FileInspection.canWrite(this.config.directory))) {
      return PrerequisiteVerification.failure("Directory is not writable");
    }

    if (permissions.execute && !(await this.deps.FileInspection.canExecute(this.config.directory))) {
      return PrerequisiteVerification.failure("Directory is not executable");
    }

    return PrerequisiteVerification.success;
  }

  get kind(): string {
    return "directory";
  }
}
