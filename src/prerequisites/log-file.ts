import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { LoggerPort } from "../logger.port";
import * as prereqs from "../prerequisites.service";
import { PrerequisiteFile } from "./file";

type Dependencies = { Logger: LoggerPort };

export class PrerequisiteLogFile implements prereqs.Prerequisite {
  readonly kind = "log-file";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(
    config: prereqs.PrerequisiteConfigType,
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const path = this.deps.Logger.getFilePath();
      if (!path) return prereqs.Verification.undetermined(stopwatch.stop());

      const file = new PrerequisiteFile({
        label: this.label,
        file: path,
        permissions: { read: true, write: true },
      });

      return file.verify(clock);
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
