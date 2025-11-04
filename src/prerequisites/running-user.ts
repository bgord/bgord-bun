import os from "node:os";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRunningUser implements prereqs.Prerequisite {
  readonly kind = "running-user";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly username: string;

  constructor(config: prereqs.PrerequisiteConfigType & { username: string }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.username = config.username;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const current = os.userInfo().username;

    if (current === this.username) return prereqs.Verification.success(stopwatch.stop());
    return prereqs.Verification.failure(stopwatch.stop(), { message: `Current user: ${current}` });
  }
}
