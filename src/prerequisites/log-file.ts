import type { LoggerPort } from "../logger.port";
import * as prereqs from "../prerequisites.service";
import { PrerequisiteFile } from "./file";

type Dependencies = { Logger: LoggerPort };

export class PrerequisiteLogFile implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(
    config: prereqs.PrerequisiteConfigType,
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();

    try {
      const path = this.deps.Logger.getFilePath();
      if (!path) return prereqs.PrerequisiteVerification.undetermined();

      const file = new PrerequisiteFile({
        label: this.label,
        file: path,
        permissions: { read: true, write: true },
      });

      return file.verify();
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "log-file";
  }
}
