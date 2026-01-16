import { describe, expect, test } from "bun:test";
import { InFlightRequestsTracker } from "../src/in-flight-requests-tracker.service";

describe("InFlightRequestsTracker service", () => {
  test("happy path", () => {
    InFlightRequestsTracker._resetForTest();

    expect(InFlightRequestsTracker.get()).toEqual(0);

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(1);

    InFlightRequestsTracker.increment();

    expect(InFlightRequestsTracker.get()).toEqual(2);

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(1);

    InFlightRequestsTracker.decrement();

    expect(InFlightRequestsTracker.get()).toEqual(0);
  });
});
