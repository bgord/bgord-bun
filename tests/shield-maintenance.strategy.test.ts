import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ShieldMaintenanceStrategy } from "../src/shield-maintenance.strategy";

describe("ShieldMaintenanceStrategy", () => {
  test("enabled - default retry after", () => {
    const strategy = new ShieldMaintenanceStrategy({ enabled: true });

    expect(strategy.evaluate()).toEqual({ enabled: true, RetryAfter: tools.Duration.Hours(1) });
  });

  test("enabled - custom retry after", () => {
    const RetryAfter = tools.Duration.Hours(2);
    const strategy = new ShieldMaintenanceStrategy({ enabled: true, RetryAfter });

    expect(strategy.evaluate()).toEqual({ enabled: true, RetryAfter });
  });

  test("disabled", () => {
    const strategy = new ShieldMaintenanceStrategy({ enabled: false });

    expect(strategy.evaluate()).toEqual({ enabled: false, RetryAfter: tools.Duration.Hours(1) });
  });

  test("no config - disabled by default", () => {
    const strategy = new ShieldMaintenanceStrategy();

    expect(strategy.evaluate().enabled).toEqual(false);
  });
});
