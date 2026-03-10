import { describe, expect, spyOn, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { HttpLoggerMiddleware } from "../src/http-logger.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Stopwatch } from "../src/stopwatch.service";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const deps = { Logger, Clock };

const middleware = new HttpLoggerMiddleware(deps);

describe("HttpLoggerMiddleware", () => {
  test("before", () => {
    using loggerHttp = spyOn(Logger, "http");
    const context = new RequestContextBuilder()
      .withMethod("GET")
      .withUrl("http://localhost/ping?page=1")
      .withHeader("keep", "value")
      .withQuery({ page: "1" })
      .withParams({ id: "123" })
      .build();

    const result = middleware.before(context, mocks.correlationId, { foo: "bar" });

    expect(result.stopwatch).toBeInstanceOf(Stopwatch);
    expect(loggerHttp).toHaveBeenCalledWith({
      component: "http",
      operation: "http_request_before",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: "http://localhost/ping?page=1",
      client: { ip: undefined, ua: undefined },
      metadata: {
        params: { id: "123" },
        headers: { keep: "value" },
        body: { foo: "bar" },
        query: { page: "1" },
      },
    });
  });

  test("200", () => {
    using loggerHttp = spyOn(Logger, "http");
    const context = new RequestContextBuilder().withMethod("GET").withUrl("http://localhost/ping").build();
    const stopwatch = new Stopwatch(deps);
    const input = {
      stopwatch,
      status: 200,
      cacheHit: false,
      responseBody: { message: "OK" },
    };

    middleware.after(context, mocks.correlationId, input);

    expect(loggerHttp).toHaveBeenCalledWith({
      cacheHit: false,
      client: { ip: undefined, ua: undefined },
      component: "http",
      correlationId: mocks.correlationId,
      durationMs: expect.any(Number),
      message: "response",
      metadata: { response: { message: "OK" } },
      method: "GET",
      operation: "http_request_after",
      status: 200,
      url: "http://localhost/ping",
    });
  });

  test("400", () => {
    using loggerError = spyOn(Logger, "error");
    const context = new RequestContextBuilder().withMethod("GET").withUrl("http://localhost/error").build();
    const stopwatch = new Stopwatch(deps);
    const input = {
      stopwatch,
      status: 400,
      cacheHit: false,
      responseBody: { error: mocks.IntentionalError },
    };

    middleware.after(context, mocks.correlationId, input);

    expect(loggerError).toHaveBeenCalledWith({
      cacheHit: false,
      client: { ip: undefined, ua: undefined },
      component: "http",
      correlationId: mocks.correlationId,
      durationMs: expect.any(Number),
      message: "response",
      metadata: { response: { error: mocks.IntentionalError } },
      method: "GET",
      operation: "http_request_after",
      status: 400,
      url: "http://localhost/error",
    });
  });

  test("500", () => {
    using loggerError = spyOn(Logger, "error");
    const context = new RequestContextBuilder().withMethod("GET").withUrl("http://localhost/error").build();
    const stopwatch = new Stopwatch(deps);
    const input = {
      stopwatch,
      status: 500,
      cacheHit: false,
      responseBody: { error: mocks.IntentionalError },
    };

    middleware.after(context, mocks.correlationId, input);

    expect(loggerError).toHaveBeenCalledWith({
      cacheHit: false,
      client: { ip: undefined, ua: undefined },
      component: "http",
      correlationId: mocks.correlationId,
      durationMs: expect.any(Number),
      message: "response",
      metadata: { response: { error: mocks.IntentionalError } },
      method: "GET",
      operation: "http_request_after",
      status: 500,
      url: "http://localhost/error",
    });
  });

  test("skip - path", () => {
    const middleware = new HttpLoggerMiddleware(deps, { skip: ["/i18n/", "/api/"] });
    const i18n = new RequestContextBuilder().withPath("/i18n/en.json").build();
    const api = new RequestContextBuilder().withPath("/api/users").build();
    const ping = new RequestContextBuilder().withPath("/ping").build();

    expect(middleware.shouldSkip(i18n)).toEqual(true);
    expect(middleware.shouldSkip(api)).toEqual(true);
    expect(middleware.shouldSkip(ping)).toEqual(false);
  });

  test("skip - SSE", () => {
    const middleware = new HttpLoggerMiddleware(deps, { skip: undefined });
    const context = new RequestContextBuilder().withHeader("accept", "text/event-stream").build();

    expect(middleware.shouldSkip(context)).toEqual(true);
  });

  test("skip - no config", () => {
    const middleware = new HttpLoggerMiddleware(deps, { skip: undefined });
    const context = new RequestContextBuilder().withPath("/anything").build();

    expect(middleware.shouldSkip(context)).toEqual(false);
  });

  test("cache-hit", () => {
    using loggerHttp = spyOn(Logger, "http");
    const context = new RequestContextBuilder().withMethod("GET").withUrl("http://localhost/ping").build();
    const stopwatch = new Stopwatch(deps);
    const input = {
      stopwatch,
      status: 200,
      cacheHit: true,
      responseBody: { message: "OK" },
    };

    middleware.after(context, mocks.correlationId, input);

    expect(loggerHttp).toHaveBeenCalledWith({
      cacheHit: true,
      client: { ip: undefined, ua: undefined },
      component: "http",
      correlationId: mocks.correlationId,
      durationMs: expect.any(Number),
      message: "response",
      metadata: { response: { message: "OK" } },
      method: "GET",
      operation: "http_request_after",
      status: 200,
      url: "http://localhost/ping",
    });
  });
});
