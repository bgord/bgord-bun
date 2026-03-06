import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimingMiddleware } from "../src/timing.middleware";
import { TimingExpressMiddleware } from "../src/timing-express.middleware";
import * as mocks from "./mocks";

const duration = tools.Duration.Ms(10);

describe("TimingExpressMiddleware", () => {
  test("sync", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = express()
      .use(new TimingExpressMiddleware({ Clock }).handle())
      .get("/ping", (_request, response) => {
        Clock.advanceBy(duration);
        response.send("ok");
      });

    const response = await request(app).get("/ping");

    expect(response.status).toEqual(200);
    expect(response.headers[TimingMiddleware.HEADER_NAME.toLowerCase()]).toEqual(`total;dur=${duration}`);
    expect(response.text).toEqual("ok");
  });

  test("async", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = express()
      .use(new TimingExpressMiddleware({ Clock }).handle())
      .get("/async", async (_request, response) => {
        Clock.advanceBy(duration);
        response.send("ok");
      });

    const response = await request(app).get("/async");

    expect(response.status).toEqual(200);
    expect(response.headers[TimingMiddleware.HEADER_NAME.toLowerCase()]).toEqual(`total;dur=${duration}`);
    expect(response.text).toEqual("ok");
  });

  test("zero", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = express()
      .use(new TimingExpressMiddleware({ Clock }).handle())
      .get("/instant", (_request, response) => response.send("fast"));

    const response = await request(app).get("/instant");

    expect(response.status).toEqual(200);
    expect(response.headers[TimingMiddleware.HEADER_NAME.toLowerCase()]).toEqual("total;dur=0");
  });

  test("error", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = express()
      .use(new TimingExpressMiddleware({ Clock }).handle())
      .get("/error", () => {
        Clock.advanceBy(duration);
        throw new Error(mocks.IntentionalError);
      })
      .use(
        (error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) =>
          response.status(500).send(error.message),
      );

    const response = await request(app).get("/error");

    expect(response.status).toEqual(500);
    expect(response.headers[TimingMiddleware.HEADER_NAME.toLowerCase()]).toEqual(`total;dur=${duration}`);
  });
});
