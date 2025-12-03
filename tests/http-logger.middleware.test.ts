import { describe, expect, jest, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { HttpLogger } from "../src/http-logger.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const ip = {
  server: {
    requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }),
  },
};

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();

const deps = { Logger, Clock };

const app = new Hono()
  .use(requestId())
  .use(HttpLogger.build(deps, { skip: ["/i18n/"] }))
  .use(timing())
  .get("/ping", (c) => c.json({ message: "OK" }))
  .get("/pong", (c) => c.json({ message: "general.unknown" }, 500))
  .get("/i18n/en.json", (c) => c.json({ hello: "world" }));

describe("HttpLogger middleware", () => {
  test("200", async () => {
    const loggerHttp = spyOn(Logger, "http").mockImplementation(jest.fn());

    const result = await app.request("/ping", { method: "GET", headers: { keep: "abc", origin: "def" } }, ip);

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenCalledTimes(2);

    expect(loggerHttp).toHaveBeenNthCalledWith(
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
        metadata: { headers: { keep: "abc" } },
      }),
    );

    expect(loggerHttp).toHaveBeenNthCalledWith(
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
  });

  test("500", async () => {
    const loggerHttp = spyOn(Logger, "http").mockImplementation(jest.fn());

    const result = await app.request("/pong", { method: "GET" }, ip);

    expect(result.status).toEqual(500);
    expect(loggerHttp).toHaveBeenCalledTimes(2);

    expect(loggerHttp).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        operation: "http_request_before",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "request",
        method: "GET",
        url: "http://localhost/pong",
        client: { ip: "127.0.0.1", ua: "anon" },
        metadata: {},
      }),
    );

    expect(loggerHttp).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        operation: "http_request_after",
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
        message: "response",
        method: "GET",
        url: "http://localhost/pong",
        status: 500,
        durationMs: expect.any(Number),
        client: { ip: "127.0.0.1", ua: "anon" },
        cacheHit: false,
        metadata: { response: { message: "general.unknown" } },
      }),
    );
  });

  test("skip", async () => {
    const loggerHttp = spyOn(Logger, "http").mockImplementation(jest.fn());

    const result = await app.request("/i18n/en.json", { method: "GET" }, ip);

    expect(result.status).toEqual(200);
    expect(loggerHttp).not.toHaveBeenCalled();
  });
});
