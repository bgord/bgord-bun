import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { InFlightRequestsExpressMiddleware } from "../src/in-flight-requests-express.middleware";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";
import * as mocks from "./mocks";

describe("InFlightRequestsExpressMiddleware", () => {
  test("happy path", async () => {
    InFlightRequestsTracker._resetForTest();

    const app = express()
      .use(new InFlightRequestsExpressMiddleware().handle())
      .get("/ok", async (_request, response) => {
        expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(1));

        response.send("ok");
      });

    const response = await request(app).get("/ok");

    expect(response.status).toEqual(200);
    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(0));
  });

  test("error", async () => {
    InFlightRequestsTracker._resetForTest();

    const app = express()
      .use(new InFlightRequestsExpressMiddleware().handle())
      .get("/failure", async () => {
        expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(1));

        throw new Error(mocks.IntentionalError);
      })
      .use(
        (_error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) =>
          response.status(500).send("failure"),
      );

    const response = await request(app).get("/failure");

    expect(response.status).toEqual(500);
    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(0));
  });
});
