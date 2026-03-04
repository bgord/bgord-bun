import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldMaintenanceHonoStrategy } from "../src/shield-maintenance-hono.strategy";

describe("ShieldMaintenanceHonoStrategy", () => {
  test("enabled - default retry after", async () => {
    const shield = new ShieldMaintenanceHonoStrategy({ enabled: true });
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(503);
    expect(json).toEqual({ reason: "maintenance" });
    expect(header).toEqual(tools.Duration.Hours(1).seconds.toString());
  });

  test("enabled - custom retry after", async () => {
    const RetryAfter = tools.Duration.Hours(2);
    const shield = new ShieldMaintenanceHonoStrategy({ enabled: true, RetryAfter });
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(503);
    expect(json).toEqual({ reason: "maintenance" });
    expect(header).toEqual(RetryAfter.seconds.toString());
  });

  test("disabled", async () => {
    const shield = new ShieldMaintenanceHonoStrategy({ enabled: false });
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const text = await result.text();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(200);
    expect(text).toEqual("OK");
    expect(header).toEqual(null);
  });

  test("no config - disabled by default", async () => {
    const shield = new ShieldMaintenanceHonoStrategy();
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const text = await result.text();

    expect(result.status).toEqual(200);
    expect(text).toEqual("OK");
  });
});
