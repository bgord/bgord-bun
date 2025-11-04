import { constants } from "node:fs";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteDirectory implements prereqs.Prerequisite {
  readonly kind = "directory";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
  private readonly access?: { write?: boolean; execute?: boolean };

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
      access?: { write?: boolean; execute?: boolean };
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.directory = config.directory;
    this.access = config.access;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const write = this.access?.write ?? false;
    const execute = this.access?.execute ?? false;

    const flags = constants.R_OK | (write ? constants.W_OK : 0) | (execute ? constants.X_OK : 0);

    try {
      await fsp.access(this.directory, flags);

      return prereqs.Verification.success(stopwatch.stop());
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
