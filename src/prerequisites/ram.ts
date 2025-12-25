import os from "node:os";
import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRAM implements prereqs.Prerequisite {
  readonly kind = "ram";
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

    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.minimum)) return prereqs.Verification.success();
    return prereqs.Verification.failure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` });
  }
}
