import os from "node:os";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteOs implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly accepted: string[];

  constructor(config: prereqs.PrerequisiteConfigType & { accepted: string[] }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.accepted = config.accepted;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();

    const type = os.type();

    if (this.accepted.map((type) => type.toLowerCase()).includes(type.toLowerCase())) {
      return prereqs.PrerequisiteVerification.success;
    }
    return prereqs.PrerequisiteVerification.failure({
      message: `Unacceptable os: ${this.accepted.join(", ")}`,
    });
  }

  get kind() {
    return "os";
  }
}
