import * as tools from "@bgord/tools";
import { Invariant, InvariantFailureKind } from "../../../invariant.service";

class FeatureFlagEnabledError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, FeatureFlagEnabledError.prototype);
  }
}

type FeatureFlagEnabledConfigType = { flag: tools.FeatureFlagValueType };

class FeatureFlagEnabledFactory extends Invariant<FeatureFlagEnabledConfigType> {
  passes(config: FeatureFlagEnabledConfigType) {
    return tools.FeatureFlag.from(config.flag).isEnabled();
  }
  // Stryker disable next-line StringLiteral
  message = "feature.flag.disabled";
  error = FeatureFlagEnabledError;
  kind = InvariantFailureKind.forbidden;
}

export const FeatureFlagEnabled = new FeatureFlagEnabledFactory();
