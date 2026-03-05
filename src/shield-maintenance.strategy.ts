import * as tools from "@bgord/tools";

export type ShieldMaintenanceConfig = { enabled: boolean; RetryAfter?: tools.Duration };

export class ShieldMaintenanceStrategy {
  private readonly enabled: boolean;
  private readonly RetryAfter: tools.Duration;

  constructor(config?: ShieldMaintenanceConfig) {
    this.enabled = config?.enabled ?? false;
    this.RetryAfter = config?.RetryAfter ?? tools.Duration.Hours(1);
  }

  evaluate(): { enabled: boolean; RetryAfter: tools.Duration } {
    return { enabled: this.enabled, RetryAfter: this.RetryAfter };
  }
}
