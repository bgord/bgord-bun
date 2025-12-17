import { access, constants } from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteFile implements prereqs.Prerequisite {
  readonly kind = "file";
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

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const path = this.file.get();

      const exists = await Bun.file(path).exists();
      if (!exists) return prereqs.Verification.failure(stopwatch.stop(), { message: "File does not exist" });

      if (this.permissions.read) {
        try {
          await access(path, constants.R_OK);
        } catch {
          return prereqs.Verification.failure(stopwatch.stop(), { message: "File is not readable" });
        }
      }

      if (this.permissions.write) {
        try {
          await access(path, constants.W_OK);
        } catch {
          return prereqs.Verification.failure(stopwatch.stop(), { message: "File is not writable" });
        }
      }

      if (this.permissions.execute) {
        try {
          await access(path, constants.X_OK);
        } catch {
          return prereqs.Verification.failure(stopwatch.stop(), { message: "File is not executable" });
        }
      }

      return prereqs.Verification.success(stopwatch.stop());
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
