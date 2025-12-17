import { access, constants, stat } from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export type PrerequisiteDirectoryPermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteDirectory implements prereqs.Prerequisite {
  readonly kind = "directory";
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

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const stats = await stat(this.directory);

      if (!stats.isDirectory()) {
        return prereqs.Verification.failure(stopwatch.stop(), { message: "Not a directory" });
      }
    } catch {
      return prereqs.Verification.failure(stopwatch.stop(), { message: "Directory does not exist" });
    }

    if (this.permissions.read) {
      try {
        await access(this.directory, constants.R_OK);
      } catch {
        return prereqs.Verification.failure(stopwatch.stop(), { message: "Directory is not readable" });
      }
    }

    if (this.permissions.write) {
      try {
        await access(this.directory, constants.W_OK);
      } catch {
        return prereqs.Verification.failure(stopwatch.stop(), { message: "Directory is not writable" });
      }
    }

    if (this.permissions.execute) {
      try {
        await access(this.directory, constants.X_OK);
      } catch {
        return prereqs.Verification.failure(stopwatch.stop(), { message: "Directory is not executable" });
      }
    }

    return prereqs.Verification.success(stopwatch.stop());
  }
}
