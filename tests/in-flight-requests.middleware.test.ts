import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { InFlightRequests } from "../src/in-flight-requests.middleware";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";
import * as mocks from "./mocks";

describe("InFlightRequests middleware", () => {
  test("happy path", async () => {
    InFlightRequestsTracker._resetForTest();

    const app = new Hono().use(InFlightRequests.handle()).get("/ok", async () => {
      expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(1));

      return new Response("ok");
    });

    const response = await app.request("/ok");

    expect(response.status).toEqual(200);
    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(0));
  });

  test("decrement - on error", async () => {
    InFlightRequestsTracker._resetForTest();

    const app = new Hono()
      .use(InFlightRequests.handle())
      .get("/failure", async () => {
        expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(1));

        throw new Error(mocks.IntentionalError);
      })
      .onError(() => new Response("failure", { status: 500 }));

    const response = await app.request("/failure");

    expect(response.status).toEqual(500);
    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(0));
  });
});
