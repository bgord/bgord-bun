import type * as tools from "@bgord/tools";

export type ShieldFeatureFlagConfig = { flag: tools.FeatureFlag };

export class ShieldFeatureFlagStrategy {
  constructor(private readonly config: ShieldFeatureFlagConfig) {}

  evaluate(): boolean {
    return this.config.flag.isEnabled();
  }
}
