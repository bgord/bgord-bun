import { describe, expect, jest, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";
import { HttpLogger } from "../src/http-logger.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const ip = {
  server: {
    requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }),
  },
};

describe("HttpLogger middleware", () => {
  test("logs correct 200 HTTP log", async () => {
    const logger = new LoggerNoopAdapter();
    const loggerHttpSpy = spyOn(logger, "http").mockImplementation(jest.fn());

    const app = new Hono();
    app.use(requestId());
    app.use(HttpLogger.build(logger));
    app.use(timing());
    app.get("/ping", (c) => c.json({ message: "OK" }));

    const result = await app.request("/ping", { method: "GET" }, ip);

    expect(result.status).toEqual(200);
    expect(loggerHttpSpy).toHaveBeenCalledTimes(2);

    expect(loggerHttpSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        component: "http",
        operation: "http_request_before",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "request",
        method: "GET",
        url: "http://localhost/ping",
        client: { ip: "127.0.0.1", ua: "anon" },
        metadata: {},
      }),
    );

    expect(loggerHttpSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        component: "http",
        operation: "http_request_after",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "response",
        method: "GET",
        url: "http://localhost/ping",
        status: 200,
        durationMs: expect.any(Number),
        client: { ip: "127.0.0.1", ua: "anon" },
        cacheHit: false,
        metadata: { response: { message: "OK" } },
      }),
    );

    loggerHttpSpy.mockRestore();
  });

  test("logs correct 400 HTTP log", async () => {
    const logger = new LoggerNoopAdapter();
    const loggerHttpSpy = spyOn(logger, "http").mockImplementation(jest.fn());

    const app = new Hono();
    app.use(requestId());
    app.use(HttpLogger.build(logger));
    app.use(timing());
    app.get("/ping", (c) => {
      return c.json({ message: "general.unknown" }, 500);
    });

    const result = await app.request("/ping", { method: "GET" }, ip);

    expect(result.status).toEqual(500);
    expect(loggerHttpSpy).toHaveBeenCalledTimes(2);

    expect(loggerHttpSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        operation: "http_request_before",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "request",
        method: "GET",
        url: "http://localhost/ping",
        client: { ip: "127.0.0.1", ua: "anon" },
        metadata: {},
      }),
    );

    expect(loggerHttpSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        operation: "http_request_after",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "response",
        method: "GET",
        url: "http://localhost/ping",
        status: 500,
        durationMs: expect.any(Number),
        client: { ip: "127.0.0.1", ua: "anon" },
        cacheHit: false,
        metadata: { response: { message: "general.unknown" } },
      }),
    );

    loggerHttpSpy.mockRestore();
  });
});
