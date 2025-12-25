import { access, constants, stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierDirectoryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      permissions?: PrerequisiteDirectoryPermissionsType;
    },
  ) {}

  async verify() {
    try {
      const stats = await stat(this.config.directory);

      if (!stats.isDirectory()) return PrerequisiteVerification.failure({ message: "Not a directory" });
    } catch {
      return PrerequisiteVerification.failure({ message: "Directory does not exist" });
    }

    const permissions = this.config.permissions ?? {};

    if (permissions.read) {
      try {
        await access(this.config.directory, constants.R_OK);
      } catch {
        return PrerequisiteVerification.failure({ message: "Directory is not readable" });
      }
    }

    if (permissions.write) {
      try {
        await access(this.config.directory, constants.W_OK);
      } catch {
        return PrerequisiteVerification.failure({ message: "Directory is not writable" });
      }
    }

    if (permissions.execute) {
      try {
        await access(this.config.directory, constants.X_OK);
      } catch {
        return PrerequisiteVerification.failure({ message: "Directory is not executable" });
      }
    }

    return PrerequisiteVerification.success;
  }

  get kind() {
    return "directory";
  }
}
