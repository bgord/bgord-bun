import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { LoggerPort } from "../logger.port";
import * as prereqs from "../prerequisites.service";

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

      const result = await Bun.file(path.get()).exists();

      if (result) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop(), { message: `Missing file: ${path.get()}` });
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
