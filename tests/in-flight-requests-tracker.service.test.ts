import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";

describe("InFlightRequestsTracker", () => {
  test("happy path", () => {
    InFlightRequestsTracker._resetForTest();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Int.of(0));

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Int.of(1));

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Int.of(2));

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Int.of(1));

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(tools.Int.of(0));
  });
});
