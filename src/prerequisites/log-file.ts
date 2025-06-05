import { Logger } from "../logger";
import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

type PrerequisiteLogFileConfigType = {
  logger: Logger;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteLogFile extends AbstractPrerequisite<PrerequisiteLogFileConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.logFile;

  constructor(readonly config: PrerequisiteLogFileConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    try {
      const path = this.config.logger.getProductionLogFilePath();

      const result = await Bun.file(path).exists();

      return result ? this.pass() : this.reject();
    } catch (error) {
      return this.reject();
    }
  }
}
