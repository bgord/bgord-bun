import { describe, expect, spyOn, test, jest } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";

import { HttpLogger } from "../src/http-logger";
import { Logger } from "../src/logger";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import * as testcases from "./testcases";

describe("HttpLogger middleware", () => {
  test("logs correct 200 HTTP log", async () => {
    const logger = new Logger({
      app: "bgord-bun-api",
      environment: NodeEnvironmentEnum.local,
    });

    const loggerHttpSpy = spyOn(logger, "http").mockImplementation(jest.fn());

    const app = new Hono();
    app.use(requestId());
    app.use(HttpLogger.build(logger));
    app.use(timing());
    app.get("/ping", (c) => c.json({ message: "OK" }));

    const result = await app.request("/ping", { method: "GET" }, testcases.ip);

    expect(result.status).toEqual(200);
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
        client: { ip: "127.0.0.1", userAgent: undefined },
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
        responseCode: 200,
        durationMs: expect.any(Number),
        client: { ip: "127.0.0.1", userAgent: undefined },
        metadata: { response: { message: "OK" } },
      }),
    );

    loggerHttpSpy.mockRestore();
  });

  test("logs correct 400 HTTP log", async () => {
    const logger = new Logger({
      app: "bgord-bun-api",
      environment: NodeEnvironmentEnum.local,
    });

    const loggerHttpSpy = spyOn(logger, "http").mockImplementation(jest.fn());

    const app = new Hono();
    app.use(requestId());
    app.use(HttpLogger.build(logger));
    app.use(timing());
    app.get("/ping", (c) => {
      return c.json({ message: "general.unknown" }, 500);
    });

    const result = await app.request("/ping", { method: "GET" }, testcases.ip);

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
        client: { ip: "127.0.0.1", userAgent: undefined },
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
        responseCode: 500,
        durationMs: expect.any(Number),
        client: { ip: "127.0.0.1", userAgent: undefined },
        metadata: { response: { message: "general.unknown" } },
      }),
    );

    loggerHttpSpy.mockRestore();
  });
});
