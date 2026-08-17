import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { Maintenance } from "../src/shield-maintenance.strategy";
import { ShieldMaintenanceHonoStrategy } from "../src/shield-maintenance-hono.strategy";

const MaintenanceConfigEnabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.yes,
});

const MaintenanceConfigDisabled = new ReactiveConfigNoopAdapter(Maintenance, {
  enabled: tools.FeatureFlagEnum.no,
});

const build = (shield: ShieldMaintenanceHonoStrategy) =>
  new Hono()
    .basePath("/api")
    .use(shield.handle())
    .get("/liveness", () => new Response("OK"))
    .get("/readiness", () => new Response("OK"))
    .get("/healthcheck", () => new Response("OK"))
    .get("/ping", () => new Response("OK"));

describe("ShieldMaintenanceHonoStrategy", () => {
  test("skip - no rules", async () => {
    const app = build(new ShieldMaintenanceHonoStrategy({ MaintenanceConfig: MaintenanceConfigEnabled }));

    const result = await app.request("/api/liveness", { method: "GET" });

    expect(result.status).toEqual(503);
  });

  test("skip - string prefix", async () => {
    const app = build(
      new ShieldMaintenanceHonoStrategy({
        MaintenanceConfig: MaintenanceConfigEnabled,
        skip: ["/api/liveness"],
      }),
    );

    const skipped = await app.request("/api/liveness", { method: "GET" });
    const guarded = await app.request("/api/ping", { method: "GET" });

    expect(skipped.status).toEqual(200);
    expect(await skipped.text()).toEqual("OK");
    expect(guarded.status).toEqual(503);
  });

  test("skip - url pattern", async () => {
    const app = build(
      new ShieldMaintenanceHonoStrategy({
        MaintenanceConfig: MaintenanceConfigEnabled,
        skip: [new URLPattern({ pathname: "/api/:probe(liveness|readiness)" })],
      }),
    );

    const skipped = await app.request("/api/readiness", { method: "GET" });
    const guarded = await app.request("/api/healthcheck", { method: "GET" });

    expect(skipped.status).toEqual(200);
    expect(await skipped.text()).toEqual("OK");
    expect(guarded.status).toEqual(503);
  });

  test("enabled - default retry after", async () => {
    const app = build(new ShieldMaintenanceHonoStrategy({ MaintenanceConfig: MaintenanceConfigEnabled }));

    const result = await app.request("/api/ping", { method: "GET" });

    expect(result.status).toEqual(503);
    expect(await result.json()).toEqual({ reason: "maintenance" });
    expect(result.headers.get("Retry-After")).toEqual(tools.Duration.Hours(1).seconds.toString());
  });

  test("enabled - custom retry after", async () => {
    const RetryAfter = tools.Duration.Hours(2);
    const app = build(
      new ShieldMaintenanceHonoStrategy({ MaintenanceConfig: MaintenanceConfigEnabled, RetryAfter }),
    );

    const result = await app.request("/api/ping", { method: "GET" });

    expect(result.status).toEqual(503);
    expect(await result.json()).toEqual({ reason: "maintenance" });
    expect(result.headers.get("Retry-After")).toEqual(RetryAfter.seconds.toString());
  });

  test("enabled - rounding", async () => {
    const RetryAfter = tools.Duration.Ms(1500);
    const app = build(
      new ShieldMaintenanceHonoStrategy({ MaintenanceConfig: MaintenanceConfigEnabled, RetryAfter }),
    );

    const result = await app.request("/api/ping", { method: "GET" });

    expect(result.status).toEqual(503);
    expect(await result.json()).toEqual({ reason: "maintenance" });
    expect(result.headers.get("Retry-After")).toEqual("2");
  });

  test("disabled", async () => {
    const app = build(new ShieldMaintenanceHonoStrategy({ MaintenanceConfig: MaintenanceConfigDisabled }));

    const result = await app.request("/api/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("OK");
    expect(result.headers.get("Retry-After")).toEqual(null);
  });

  test("no config - disabled by default", async () => {
    const app = build(new ShieldMaintenanceHonoStrategy());

    const result = await app.request("/api/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("OK");
  });
});
