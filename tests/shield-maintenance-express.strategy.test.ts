import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ShieldMaintenanceExpressStrategy } from "../src/shield-maintenance-express.strategy";

describe("ShieldMaintenanceExpressStrategy", () => {
  test("enabled - default retry after", async () => {
    const shield = new ShieldMaintenanceExpressStrategy({ enabled: true });
    const app = express()
      .use(shield.handle())
      .get("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(503);
    expect(result.body).toEqual({ reason: "maintenance" });
    expect(result.headers["retry-after"]).toEqual(tools.Duration.Hours(1).seconds.toString());
  });

  test("enabled - custom retry after", async () => {
    const RetryAfter = tools.Duration.Hours(2);
    const shield = new ShieldMaintenanceExpressStrategy({ enabled: true, RetryAfter });
    const app = express()
      .use(shield.handle())
      .get("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(503);
    expect(result.body).toEqual({ reason: "maintenance" });
    expect(result.headers["retry-after"]).toEqual(RetryAfter.seconds.toString());
  });

  test("disabled", async () => {
    const shield = new ShieldMaintenanceExpressStrategy({ enabled: false });
    const app = express()
      .use(shield.handle())
      .get("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("OK");
    expect(result.headers["retry-after"]).toBeUndefined();
  });

  test("no config - disabled by default", async () => {
    const shield = new ShieldMaintenanceExpressStrategy();
    const app = express()
      .use(shield.handle())
      .get("/ping", (_request, response) => response.send("OK"));

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("OK");
  });
});
