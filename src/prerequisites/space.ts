import path from "node:path";
import * as tools from "@bgord/tools";
import checkDiskSpace from "check-disk-space";
import * as prereqs from "../prerequisites.service";

type PrerequisiteSpaceConfigType = {
  minimum: tools.Size;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteSpace extends prereqs.AbstractPrerequisite<PrerequisiteSpaceConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.space;

  constructor(readonly config: PrerequisiteSpaceConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const fsRoot = path.sep;
    const bytes = await checkDiskSpace(fsRoot);

    const freeDiskSpace = new tools.Size({
      unit: tools.SizeUnit.b,
      value: bytes.free,
    });

    if (freeDiskSpace.isGreaterThan(this.config.minimum)) return this.pass();
    return this.reject();
  }
}
