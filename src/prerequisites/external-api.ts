import * as prereqs from "../prerequisites";

type PrerequisiteExternalApiConnectivityConfigType = {
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
  request: () => Promise<Response>;
};

export class PrerequisiteExternalApi extends prereqs.AbstractPrerequisite<PrerequisiteExternalApiConnectivityConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.externalApi;

  constructor(readonly config: PrerequisiteExternalApiConnectivityConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      const result = await this.config.request();

      return result.ok ? this.pass() : this.reject();
    } catch (error) {
      return this.reject();
    }
  }
}
