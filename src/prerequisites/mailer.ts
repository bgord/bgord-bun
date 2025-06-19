import { Mailer } from "../mailer.service";
import * as prereqs from "../prerequisites.service";

type PrerequisiteMailerConfigType = {
  mailer: Mailer;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteMailer extends prereqs.AbstractPrerequisite<PrerequisiteMailerConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.mailer;

  constructor(readonly config: PrerequisiteMailerConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      await this.config.mailer.verify();
      return this.pass();
    } catch (_error) {
      return this.reject();
    }
  }
}
