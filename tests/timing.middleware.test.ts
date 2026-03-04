import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimingMiddleware } from "../src/timing.middleware";
import * as mocks from "./mocks";

const duration = tools.Duration.Ms(100);

describe("TimingMiddleware", () => {
  test("sync", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(() => Clock.advanceBy(duration))).toEqual("total;dur=100");
  });

  test("async", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(async () => Clock.advanceBy(duration))).toEqual("total;dur=100");
  });

  test("zero", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(() => {})).toEqual("total;dur=0");
  });

  test("error", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    const action = async () => {
      Clock.advanceBy(duration);
      throw new Error(mocks.IntentionalError);
    };

    expect(async () => middleware.measure(action)).toThrow(mocks.IntentionalError);
  });

  test("header name", () => {
    expect(TimingMiddleware.HEADER_NAME).toEqual("Server-Timing");
  });
});
