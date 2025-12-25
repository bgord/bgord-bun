import { access, constants, stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierDirectoryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      permissions?: PrerequisiteDirectoryPermissionsType;
    },
  ) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const stats = await stat(this.config.directory);

      if (!stats.isDirectory()) {
        return prereqs.PrerequisiteVerification.failure({ message: "Not a directory" });
      }
    } catch {
      return prereqs.PrerequisiteVerification.failure({ message: "Directory does not exist" });
    }

    const permissions = this.config.permissions ?? {};

    if (permissions.read) {
      try {
        await access(this.config.directory, constants.R_OK);
      } catch {
        return prereqs.PrerequisiteVerification.failure({ message: "Directory is not readable" });
      }
    }

    if (permissions.write) {
      try {
        await access(this.config.directory, constants.W_OK);
      } catch {
        return prereqs.PrerequisiteVerification.failure({ message: "Directory is not writable" });
      }
    }

    if (permissions.execute) {
      try {
        await access(this.config.directory, constants.X_OK);
      } catch {
        return prereqs.PrerequisiteVerification.failure({ message: "Directory is not executable" });
      }
    }

    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "directory";
  }
}
