import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import { MemoryConsumption } from "../memory-consumption.service";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteMemory implements prereqs.Prerequisite {
  readonly kind = "memory";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly maximum: tools.Size;

  constructor(config: prereqs.PrerequisiteConfigType & { maximum: tools.Size }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.maximum = config.maximum;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.maximum)) {
      return prereqs.Verification.failure(stopwatch.stop(), {
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      });
    }
    return prereqs.Verification.success(stopwatch.stop());
  }
}
