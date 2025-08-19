import type { Logger } from "../logger.service";
import * as prereqs from "../prerequisites.service";

type PrerequisiteLogFileConfigType = {
  logger: Logger;
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
      const path = this.config.logger.getProductionLogFilePath();

      const result = await Bun.file(path).exists();

      return result ? this.pass() : this.reject();
    } catch (_error) {
      return this.reject();
    }
  }
}
