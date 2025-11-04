import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { LoggerWinstonProductionAdapter } from "../logger-winston-production.adapter";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteLogFile implements prereqs.Prerequisite {
  readonly kind = "log-file";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly logger: LoggerWinstonProductionAdapter;

  constructor(config: prereqs.PrerequisiteConfigType & { logger: LoggerWinstonProductionAdapter }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.logger = config.logger;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const path = this.logger.prodLogFile;
      const result = await Bun.file(path).exists();

      if (result) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop(), { message: `Missing file: ${path}` });
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
