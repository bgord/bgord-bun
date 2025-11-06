import os from "node:os";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteOs implements prereqs.Prerequisite {
  readonly kind = "os";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly accepted: string[];

  constructor(config: prereqs.PrerequisiteConfigType & { accepted: string[] }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.accepted = config.accepted.map((type) => type.toLowerCase());
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const type = os.type();

    if (this.accepted.includes(type.toLowerCase())) return prereqs.Verification.success(stopwatch.stop());
    return prereqs.Verification.failure(stopwatch.stop(), { message: `Unacceptable os: ${type}` });
  }
}
