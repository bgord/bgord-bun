import { access, constants } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteFile implements prereqs.Prerequisite {
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

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const path = this.file.get();

      const exists = await Bun.file(path).exists();
      if (!exists) return prereqs.Verification.failure({ message: "File does not exist" });

      if (this.permissions.read) {
        try {
          await access(path, constants.R_OK);
        } catch {
          return prereqs.Verification.failure({ message: "File is not readable" });
        }
      }

      if (this.permissions.write) {
        try {
          await access(path, constants.W_OK);
        } catch {
          return prereqs.Verification.failure({ message: "File is not writable" });
        }
      }

      if (this.permissions.execute) {
        try {
          await access(path, constants.X_OK);
        } catch {
          return prereqs.Verification.failure({ message: "File is not executable" });
        }
      }

      return prereqs.Verification.success();
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }

  get kind() {
    return "file";
  }
}
