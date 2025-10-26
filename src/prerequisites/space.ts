import path from "node:path";
import * as tools from "@bgord/tools";
import checkDiskSpace from "check-disk-space";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSpace implements prereqs.Prerequisite {
  readonly kind = "space";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;
  private readonly minimum: tools.Size;

  constructor(config: prereqs.PrerequisiteConfigType & { minimum: tools.Size }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.minimum = config.minimum;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const root = path.sep;
      const bytes = await checkDiskSpace(root);
      const freeDiskSpace = tools.Size.fromBytes(bytes.free);

      if (freeDiskSpace.isGreaterThan(this.minimum)) return prereqs.Verification.success();
      return prereqs.Verification.failure({
        message: `Free disk space: ${freeDiskSpace.format(tools.Size.unit.MB)}`,
      });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
