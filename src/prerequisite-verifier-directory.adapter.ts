import { access, constants, stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierDirectoryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      permissions?: PrerequisiteDirectoryPermissionsType;
    },
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const node = await stat(this.config.directory);

      if (!node.isDirectory()) return PrerequisiteVerification.failure("Not a directory");
    } catch {
      return PrerequisiteVerification.failure("Directory does not exist");
    }

    const permissions = this.config.permissions ?? {};

    const checks = [
      { enabled: permissions.read, mode: constants.R_OK, error: "Directory is not readable" },
      { enabled: permissions.write, mode: constants.W_OK, error: "Directory is not writable" },
      { enabled: permissions.execute, mode: constants.X_OK, error: "Directory is not executable" },
    ];

    for (const check of checks) {
      if (!check.enabled) continue;

      try {
        await access(this.config.directory, check.mode);
      } catch {
        return PrerequisiteVerification.failure(check.error);
      }
    }

    return PrerequisiteVerification.success;
  }

  get kind(): string {
    return "directory";
  }
}
