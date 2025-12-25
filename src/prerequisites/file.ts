import { access, constants } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteFile implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly file: tools.FilePathAbsolute | tools.FilePathRelative;
  private readonly permissions: PrerequisiteFilePermissionsType;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      file: tools.FilePathAbsolute | tools.FilePathRelative;
      permissions?: PrerequisiteFilePermissionsType;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.file = config.file;
    this.permissions = config.permissions ?? {};
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    try {
      const path = this.file.get();

      const exists = await Bun.file(path).exists();
      if (!exists) return prereqs.PrerequisiteVerification.failure({ message: "File does not exist" });

      if (this.permissions.read) {
        try {
          await access(path, constants.R_OK);
        } catch {
          return prereqs.PrerequisiteVerification.failure({ message: "File is not readable" });
        }
      }

      if (this.permissions.write) {
        try {
          await access(path, constants.W_OK);
        } catch {
          return prereqs.PrerequisiteVerification.failure({ message: "File is not writable" });
        }
      }

      if (this.permissions.execute) {
        try {
          await access(path, constants.X_OK);
        } catch {
          return prereqs.PrerequisiteVerification.failure({ message: "File is not executable" });
        }
      }

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "file";
  }
}
