import type { LoggerWinstonProductionAdapter } from "../logger-winston-production.adapter";
import * as prereqs from "../prerequisites.service";

type PrerequisiteLogFileConfigType = {
  logger: LoggerWinstonProductionAdapter;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteLogFile extends prereqs.AbstractPrerequisite<PrerequisiteLogFileConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.logFile;

  constructor(readonly config: PrerequisiteLogFileConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      const path = this.config.logger.prodLogFile;

      // TODO: adjust checks
      const result = await Bun.file(path).exists();

      return result ? this.pass() : this.reject();
    } catch (_error) {
      return this.reject();
    }
  }
}
