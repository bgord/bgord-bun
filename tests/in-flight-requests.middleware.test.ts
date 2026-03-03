import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { InFlightRequestsMiddleware } from "../src/in-flight-requests.middleware";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";

describe("InFlightRequestsMiddleware", () => {
  test("increment", async () => {
    InFlightRequestsTracker._resetForTest();
    const middleware = new InFlightRequestsMiddleware();

    await middleware.evaluate();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(1));
  });

  test("decrement", () => {
    InFlightRequestsTracker._resetForTest();
    const middleware = new InFlightRequestsMiddleware();

    InFlightRequestsTracker.increment();
    middleware.cleanup();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Integer.parse(0));
  });
});
