import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { ShieldCsrfStrategyError } from "../src/shield-csrf.strategy";
import { ShieldCsrfExpressStrategy } from "../src/shield-csrf-express.strategy";

const APP_ORIGIN = "http://localhost:3000";
const EVIL_ORIGIN = "https://evil.example";

const shield = new ShieldCsrfExpressStrategy({ origin: [APP_ORIGIN] });

const app = express()
  .use(shield.handle())
  .get("/ping", (_request, response) => response.send("ok"))
  .post("/action", (_request, response) => response.send("ok"))
  .put("/action", (_request, response) => response.send("ok"))
  .patch("/action", (_request, response) => response.send("ok"))
  .delete("/action", (_request, response) => response.send("ok"));

describe("ShieldCsrfExpressStrategy", () => {
  test("safe method - allowed - no origin", async () => {
    const response = await request(app).get("/ping");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("safe method - allowed - good origin", async () => {
    const response = await request(app).get("/ping").set("origin", APP_ORIGIN);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("safe method - allowed - bad origin", async () => {
    const response = await request(app).get("/ping").set("origin", EVIL_ORIGIN);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("state-changing - allowed - no origin", async () => {
    const response = await request(app).post("/action");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("state-changing - allowed - good origin", async () => {
    const response = await request(app).post("/action").set("origin", APP_ORIGIN);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("state-changing - POST - not allowed - wrong origin", async () => {
    const response = await request(app).post("/action").set("origin", EVIL_ORIGIN);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual(ShieldCsrfStrategyError.Rejected);
  });

  test("state-changing - PUT - not allowed - wrong origin", async () => {
    const response = await request(app).put("/action").set("origin", EVIL_ORIGIN);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual(ShieldCsrfStrategyError.Rejected);
  });

  test("state-changing - PATCH - not allowed - wrong origin", async () => {
    const response = await request(app).patch("/action").set("origin", EVIL_ORIGIN);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual(ShieldCsrfStrategyError.Rejected);
  });

  test("state-changing - DELETE - not allowed - wrong origin", async () => {
    const response = await request(app).delete("/action").set("origin", EVIL_ORIGIN);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual(ShieldCsrfStrategyError.Rejected);
  });
});
