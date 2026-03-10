import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimingMiddleware } from "../src/timing.middleware";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const context = new RequestContextBuilder().build();
const duration = tools.Duration.Ms(100);

describe("TimingMiddleware", () => {
  test("sync", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(context, () => Clock.advanceBy(duration))).toEqual("total;dur=100");
  });

  test("sync - SSE", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });
    const context = new RequestContextBuilder().withHeader("accept", "text/event-stream").build();

    expect(await middleware.measure(context, () => Clock.advanceBy(duration))).toEqual(null);
  });

  test("async", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(context, async () => Clock.advanceBy(duration))).toEqual("total;dur=100");
  });

  test("async - SSE", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });
    const context = new RequestContextBuilder().withHeader("accept", "text/event-stream").build();

    expect(await middleware.measure(context, async () => Clock.advanceBy(duration))).toEqual(null);
  });

  test("zero", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    expect(await middleware.measure(context, () => {})).toEqual("total;dur=0");
  });

  test("error", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const middleware = new TimingMiddleware({ Clock });

    const action = async () => {
      Clock.advanceBy(duration);
      throw new Error(mocks.IntentionalError);
    };

    expect(async () => middleware.measure(context, action)).toThrow(mocks.IntentionalError);
  });

  test("header name", () => {
    expect(TimingMiddleware.HEADER_NAME).toEqual("Server-Timing");
  });
});
