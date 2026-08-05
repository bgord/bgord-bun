import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { Maintenance, ShieldMaintenanceStrategy } from "../src/shield-maintenance.strategy";

const MaintenanceConfigEnabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.yes,
});

const MaintenanceConfigDisabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.no,
});

describe("ShieldMaintenanceStrategy", () => {
  test("enabled - default retry after", async () => {
    const strategy = new ShieldMaintenanceStrategy({ MaintenanceConfig: MaintenanceConfigEnabled });

    expect(await strategy.evaluate()).toEqual({
      enabled: true,
      RetryAfter: tools.Duration.Hours(1),
    });
  });

  test("enabled - custom retry after", async () => {
    const RetryAfter = tools.Duration.Hours(2);
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      RetryAfter,
    });

    expect(await strategy.evaluate()).toEqual({ enabled: true, RetryAfter });
  });

  test("disabled", async () => {
    const strategy = new ShieldMaintenanceStrategy({ MaintenanceConfig: MaintenanceConfigDisabled });

    expect(await strategy.evaluate()).toEqual({
      enabled: false,
      RetryAfter: tools.Duration.Hours(1),
    });
  });

  test("no config - disabled by default", async () => {
    const strategy = new ShieldMaintenanceStrategy();

    expect((await strategy.evaluate()).enabled).toEqual(false);
  });
});
