import { describe, expect, test } from "bun:test";
import { FeatureFlagEnum } from "@bgord/tools";
import { FeatureFlagEnabled } from "../src/modules/system/invariants/feature-flag-enabled";

describe("FeatureFlagEnabled", () => {
  test("happy path", () => {
    expect(() => FeatureFlagEnabled.enforce({ flag: FeatureFlagEnum.yes })).not.toThrow();
  });

  test("error", () => {
    expect(() => FeatureFlagEnabled.enforce({ flag: FeatureFlagEnum.no })).toThrow(FeatureFlagEnabled.error);
  });
});
