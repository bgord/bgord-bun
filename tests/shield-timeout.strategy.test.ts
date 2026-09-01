import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { ShieldTimeoutStrategyError } from "../src/shield-timeout.strategy";
import { ShieldTimeoutHonoStrategy } from "../src/shield-timeout-hono.strategy";

const duration = tools.Duration.Ms(5);

describe("ShieldTimeoutStrategy", () => {
  test("happy path", async () => {
    const app = new Hono()
      .use(new ShieldTimeoutHonoStrategy(duration).handle())
      .get("/ping", async () => new Response("OK"));

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
  });

  test("denied - without a custom error handler", async () => {
    jest.useFakeTimers();

    const app = new Hono().use(new ShieldTimeoutHonoStrategy(duration).handle()).get("/ping", async () => {
      jest.advanceTimersByTime(duration.times(v.parse(tools.MultiplicationFactor, 2)).ms);
      return new Response("OK");
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(504);
    expect(await result.text()).toEqual("shield.timeout.rejected");

    jest.useRealTimers();
  });

  test("denied", async () => {
    jest.useFakeTimers();

    const app = new Hono()
      .use(new ShieldTimeoutHonoStrategy(duration).handle())
      .get("/ping", async () => {
        jest.advanceTimersByTime(duration.times(v.parse(tools.MultiplicationFactor, 2)).ms);
        return new Response("OK");
      })
      .onError((error) => {
        if (error.message === ShieldTimeoutStrategyError.Rejected) {
          return Response.json({ message: ShieldTimeoutStrategyError.Rejected }, { status: 408 });
        }
        return Response.json({}, { status: 500 });
      });

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(408);
    expect(json.message).toEqual("shield.timeout.rejected");

    jest.useRealTimers();
  });
});
