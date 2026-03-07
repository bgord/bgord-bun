import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ShieldTimeoutStrategyError } from "../src/shield-timeout.strategy";
import { ShieldTimeoutExpressStrategy } from "../src/shield-timeout-express.strategy";

const duration = tools.Duration.Ms(5);
const shield = new ShieldTimeoutExpressStrategy({ duration });

describe("ShieldTimeoutExpressStrategy", () => {
  test("happy path", async () => {
    const app = express()
      .use(shield.handle())
      .get("/ping", (_req, res) => res.send("OK"));

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("OK");
  });

  test("denied", async () => {
    const app = express()
      .use(shield.handle())
      .get("/ping", async (_req, res) => {
        await Bun.sleep(duration.ms * 2);
        return res.send("OK");
      });

    const result = await request(app).get("/ping");

    expect(result.status).toEqual(408);
    expect(result.body.message).toEqual(ShieldTimeoutStrategyError.Rejected);
  });
});
