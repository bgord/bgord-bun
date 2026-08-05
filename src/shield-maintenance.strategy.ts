import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ReactiveConfigPort } from "./reactive-config.port";

export const Maintenance = v.object({ enabled: tools.FeatureFlagValue });

export type MaintenanceType = v.InferOutput<typeof Maintenance>;

// Read per request - wrap a file-backed config in ReactiveConfigWithCacheAdapter
export type ShieldMaintenanceConfig = {
  MaintenanceConfig: ReactiveConfigPort<MaintenanceType>;
  RetryAfter?: tools.Duration;
};

export class ShieldMaintenanceStrategy {
  private readonly MaintenanceConfig?: ReactiveConfigPort<MaintenanceType>;
  private readonly RetryAfter: tools.Duration;

  constructor(config?: ShieldMaintenanceConfig) {
    this.MaintenanceConfig = config?.MaintenanceConfig;
    this.RetryAfter = config?.RetryAfter ?? tools.Duration.Hours(1);
  }

  async evaluate(): Promise<{ enabled: boolean; RetryAfter: tools.Duration }> {
    const maintenance = await this.MaintenanceConfig?.get();
    const enabled = maintenance ? tools.FeatureFlag.from(maintenance.enabled).isEnabled() : false;

    return { enabled, RetryAfter: this.RetryAfter };
  }
}
