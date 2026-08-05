import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ReactiveConfigPort } from "./reactive-config.port";
import type { HasRequestPath } from "./request-context.port";

export const Maintenance = v.object({ enabled: tools.FeatureFlagValue });

export type MaintenanceType = v.InferOutput<typeof Maintenance>;

export type ShieldMaintenanceConfig = {
  MaintenanceConfig: ReactiveConfigPort<MaintenanceType>;
  RetryAfter?: tools.Duration;
  skip?: ReadonlyArray<string | URLPattern>;
};

export class ShieldMaintenanceStrategy {
  private readonly MaintenanceConfig?: ReactiveConfigPort<MaintenanceType>;
  private readonly RetryAfter: tools.Duration;

  constructor(private readonly config?: ShieldMaintenanceConfig) {
    this.MaintenanceConfig = config?.MaintenanceConfig;
    this.RetryAfter = config?.RetryAfter ?? tools.Duration.Hours(1);
  }

  shouldSkip(context: HasRequestPath): boolean {
    return (
      this.config?.skip?.some((rule) => {
        if (rule instanceof URLPattern) return rule.test({ pathname: context.request.path });
        return context.request.path.startsWith(rule);
      }) ?? false
    );
  }

  async evaluate(): Promise<{ enabled: boolean; RetryAfter: tools.Duration }> {
    const maintenance = await this.MaintenanceConfig?.get();
    const enabled = maintenance ? tools.FeatureFlag.from(maintenance.enabled).isEnabled() : false;

    return { enabled, RetryAfter: this.RetryAfter };
  }
}
