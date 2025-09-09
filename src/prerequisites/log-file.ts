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

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const path = this.logger.prodLogFile;
      const result = await Bun.file(path).exists();

      if (result) return prereqs.Verification.success();
      return prereqs.Verification.failure({ message: `Missing file: ${path}` });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
