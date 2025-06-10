import sslChecker from "ssl-checker";

import * as prereqs from "../prerequisites.service";

type PrerequisiteSSLCertificateExpiryConfigType = {
  host: string;
  validDaysMinimum: number;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteSSLCertificateExpiry extends prereqs.AbstractPrerequisite<PrerequisiteSSLCertificateExpiryConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.sslCertificateExpiry;

  constructor(readonly config: PrerequisiteSSLCertificateExpiryConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      const result = await sslChecker(this.config.host);

      if (!result.valid) return prereqs.PrerequisiteStatusEnum.failure;

      return result.daysRemaining <= this.config.validDaysMinimum ? this.reject() : this.pass();
    } catch (error) {
      return this.reject();
    }
  }
}
