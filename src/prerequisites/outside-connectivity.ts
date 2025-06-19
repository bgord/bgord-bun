import * as prereqs from "../prerequisites.service";

type PrerequisiteOutsideConnectivityConfigType = {
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteOutsideConnectivity extends prereqs.AbstractPrerequisite<PrerequisiteOutsideConnectivityConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.outsideConnectivity;

  constructor(readonly config: PrerequisiteOutsideConnectivityConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      const result = await fetch("https://google.com");

      return result.ok ? this.pass() : this.reject();
    } catch (_error) {
      return this.reject();
    }
  }
}
