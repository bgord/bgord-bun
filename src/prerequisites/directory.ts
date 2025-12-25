import { access, constants, stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteDirectory implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
  private readonly permissions: PrerequisiteDirectoryPermissionsType;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      permissions?: PrerequisiteDirectoryPermissionsType;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.directory = config.directory;
    this.permissions = config.permissions ?? {};
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    try {
      const stats = await stat(this.directory);

      if (!stats.isDirectory()) {
        return prereqs.PrerequisiteVerification.failure({ message: "Not a directory" });
      }
    } catch {
      return prereqs.PrerequisiteVerification.failure({ message: "Directory does not exist" });
    }

    if (this.permissions.read) {
      try {
        await access(this.directory, constants.R_OK);
      } catch {
        return prereqs.PrerequisiteVerification.failure({ message: "Directory is not readable" });
      }
    }

    if (this.permissions.write) {
      try {
        await access(this.directory, constants.W_OK);
      } catch {
        return prereqs.PrerequisiteVerification.failure({ message: "Directory is not writable" });
      }
    }

    if (this.permissions.execute) {
      try {
        await access(this.directory, constants.X_OK);
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
