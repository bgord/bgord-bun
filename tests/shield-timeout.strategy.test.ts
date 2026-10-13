import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { ErrorClassifierHttpExceptionHonoStrategy } from "../src/error-classifier-http-exception-hono.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";
import { HttpExceptionErrors } from "../src/http-exception-errors";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { ShieldTimeoutHonoStrategy } from "../src/shield-timeout-hono.strategy";

const onError = new ErrorHonoHandler([new ErrorClassifierHttpExceptionHonoStrategy([HttpExceptionErrors])], {
  Logger: new LoggerNoopAdapter(),
}).handle();

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
      .onError(onError);

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(504);
    expect(json.message).toEqual("shield.timeout.rejected");

    jest.useRealTimers();
  });
});
