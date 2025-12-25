import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { MaintenanceMode } from "../src/maintenance-mode.middleware";

describe("MaintenanceMode middleware", () => {
  test("enabled", async () => {
    const app = new Hono().use(MaintenanceMode.build({ enabled: true })).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(503);
    expect(json).toEqual({ reason: "maintenance" });
    expect(header).toEqual(tools.Duration.Hours(1).seconds.toString());
  });

  test("enabled - custom retry after", async () => {
    const RetryAfter = tools.Duration.Hours(2);
    const app = new Hono()
      .use(MaintenanceMode.build({ enabled: true, RetryAfter }))
      .get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(503);
    expect(json).toEqual({ reason: "maintenance" });
    expect(header).toEqual(RetryAfter.seconds.toString());
  });

  test("disabled", async () => {
    const app = new Hono().use(MaintenanceMode.build()).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    const text = await result.text();
    const header = result.headers.get("Retry-After");

    expect(result.status).toEqual(200);
    expect(text).toEqual("OK");
    expect(header).toEqual(null);
  });
});
