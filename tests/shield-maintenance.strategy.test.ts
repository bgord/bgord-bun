import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { Maintenance, ShieldMaintenanceStrategy } from "../src/shield-maintenance.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const MaintenanceConfigEnabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.yes,
});

const MaintenanceConfigDisabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.no,
});

describe("ShieldMaintenanceStrategy", () => {
  test("skip - no rules", () => {
    const strategy = new ShieldMaintenanceStrategy({ MaintenanceConfig: MaintenanceConfigEnabled });

    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/liveness").build())).toEqual(false);
  });

  test("skip - string prefix", () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      skip: ["/api/liveness"],
    });

    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/liveness").build())).toEqual(true);
    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/ping").build())).toEqual(false);
  });

  test("skip - string prefix - partial path", () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      skip: ["/api"],
    });

    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/liveness").build())).toEqual(true);
  });

  test("skip - one of many rules", () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      skip: ["/api/readiness", "/api/liveness"],
    });

    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/liveness").build())).toEqual(true);
  });

  test("skip - url pattern", () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      skip: [new URLPattern({ pathname: "/api/:probe(liveness|readiness)" })],
    });

    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/readiness").build())).toEqual(true);
    expect(strategy.shouldSkip(new RequestContextBuilder().withPath("/api/healthcheck").build())).toEqual(
      false,
    );
  });

  test("enabled - default retry after", async () => {
    const strategy = new ShieldMaintenanceStrategy({ MaintenanceConfig: MaintenanceConfigEnabled });

    expect(await strategy.evaluate()).toEqual({
      enabled: true,
      code: 503,
      body: { reason: "maintenance" },
      headers: { "Retry-After": "3600" },
    });
  });

  test("enabled - custom retry after", async () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      RetryAfter: tools.Duration.Hours(2),
    });

    expect(await strategy.evaluate()).toEqual({
      enabled: true,
      code: 503,
      body: { reason: "maintenance" },
      headers: { "Retry-After": "7200" },
    });
  });

  test("enabled - rounding", async () => {
    const strategy = new ShieldMaintenanceStrategy({
      MaintenanceConfig: MaintenanceConfigEnabled,
      RetryAfter: tools.Duration.Ms(1500),
    });

    expect(await strategy.evaluate()).toEqual({
      enabled: true,
      code: 503,
      body: { reason: "maintenance" },
      headers: { "Retry-After": "2" },
    });
  });

  test("disabled", async () => {
    const strategy = new ShieldMaintenanceStrategy({ MaintenanceConfig: MaintenanceConfigDisabled });

    expect(await strategy.evaluate()).toEqual({
      enabled: false,
      code: 503,
      body: { reason: "maintenance" },
      headers: { "Retry-After": "3600" },
    });
  });

  test("no config - disabled by default", async () => {
    const strategy = new ShieldMaintenanceStrategy();

    expect((await strategy.evaluate()).enabled).toEqual(false);
  });
});
