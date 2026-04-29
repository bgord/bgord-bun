import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldFeatureFlagHonoStrategy } from "../src/shield-feature-flag-hono.strategy";

const on = tools.FeatureFlag.from(tools.FeatureFlagEnum.yes);
const off = tools.FeatureFlag.from(tools.FeatureFlagEnum.no);

describe("ShieldMaintenanceHonoStrategy", () => {
  test("enabled", async () => {
    const shield = new ShieldFeatureFlagHonoStrategy({ flag: on });
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const text = await result.text();

    expect(result.status).toEqual(200);
    expect(text).toEqual("OK");
  });

  test("disabled", async () => {
    const shield = new ShieldFeatureFlagHonoStrategy({ flag: off });
    const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(404);
  });
});
