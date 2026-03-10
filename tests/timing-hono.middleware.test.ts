import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimingMiddleware } from "../src/timing.middleware";
import { TimingHonoMiddleware } from "../src/timing-hono.middleware";
import * as mocks from "./mocks";

const duration = tools.Duration.Ms(10);

describe("TimingHonoMiddleware", () => {
  test("sync", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono().use(new TimingHonoMiddleware({ Clock }).handle()).get("/ping", (c) => {
      Clock.advanceBy(duration);
      return c.text("ok");
    });

    const response = await app.request("/ping");

    expect(response.status).toEqual(200);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual(`total;dur=${duration}`);
    expect(await response.text()).toEqual("ok");
  });

  test("sync - streaming", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono().use(new TimingHonoMiddleware({ Clock }).handle()).get("/ping", (c) => {
      Clock.advanceBy(duration);
      return c.text("ok");
    });

    const response = await app.request("/ping", { headers: { accept: "text/event-stream" } });

    expect(response.status).toEqual(200);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual(null);
    expect(await response.text()).toEqual("ok");
  });

  test("async", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono().use(new TimingHonoMiddleware({ Clock }).handle()).get("/async", async (c) => {
      Clock.advanceBy(duration);
      return c.text("ok");
    });

    const response = await app.request("/async");

    expect(response.status).toEqual(200);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual(`total;dur=${duration}`);
    expect(await response.text()).toEqual("ok");
  });

  test("async - streaming", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono().use(new TimingHonoMiddleware({ Clock }).handle()).get("/async", async (c) => {
      Clock.advanceBy(duration);
      return c.text("ok");
    });

    const response = await app.request("/async", { headers: { accept: "text/event-stream" } });

    expect(response.status).toEqual(200);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual(null);
    expect(await response.text()).toEqual("ok");
  });

  test("zero", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono()
      .use(new TimingHonoMiddleware({ Clock }).handle())
      .get("/instant", (c) => c.text("fast"));

    const response = await app.request("/instant");

    expect(response.status).toEqual(200);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual("total;dur=0");
  });

  test("error", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const app = new Hono()
      .use(new TimingHonoMiddleware({ Clock }).handle())
      .get("/error", () => {
        Clock.advanceBy(duration);
        throw new Error(mocks.IntentionalError);
      })
      .onError((_, c) => c.text(mocks.IntentionalError, 500));

    const response = await app.request("/error");

    expect(response.status).toEqual(500);
    expect(response.headers.get(TimingMiddleware.HEADER_NAME)).toEqual(`total;dur=${duration}`);
  });
});
