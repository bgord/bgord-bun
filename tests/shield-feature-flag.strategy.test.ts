import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ShieldFeatureFlagStrategy } from "../src/shield-feature-flag.strategy";

const on = tools.FeatureFlag.from(tools.FeatureFlagEnum.yes);
const off = tools.FeatureFlag.from(tools.FeatureFlagEnum.no);

describe("ShieldFeatureFlagStrategy", () => {
  test("enabled", () => {
    const strategy = new ShieldFeatureFlagStrategy({ flag: on });

    expect(strategy.evaluate()).toEqual(true);
  });

  test("disabled", () => {
    const strategy = new ShieldFeatureFlagStrategy({ flag: off });

    expect(strategy.evaluate()).toEqual(false);
  });
});
