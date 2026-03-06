import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { SlowerExpressMiddleware } from "../src/slower-express.middleware";

const duration = tools.Duration.Seconds(3);
const Sleeper = new SleeperNoopAdapter();
const deps = { Sleeper };

describe("SlowerExpressMiddleware", () => {
  test("waits before calling next", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    const middleware = new SlowerExpressMiddleware(duration, deps);
    const app = express()
      .use(middleware.handle())
      .get("/slower", (_, response) => response.send("OK"));

    const response = await request(app).get("/slower");

    expect(response.text).toEqual("OK");
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });
});
