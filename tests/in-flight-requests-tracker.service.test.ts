import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";

describe("InFlightRequestsTracker", () => {
  test("happy path", () => {
    InFlightRequestsTracker._resetForTest();

    expect(InFlightRequestsTracker.get()).toEqual(v.parse(tools.Integer, 0));

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(v.parse(tools.Integer, 1));

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(v.parse(tools.Integer, 2));

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(v.parse(tools.Integer, 1));

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(v.parse(tools.Integer, 0));
  });
});
