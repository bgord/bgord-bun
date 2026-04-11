import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { RequestContextHonoAdapter } from "../src/request-context-hono.adapter";
import * as mocks from "./mocks";

type Config = { Variables: { user: { id: number } } };

describe("RequestContextHonoAdapter", () => {
  test("path", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ path: new RequestContextHonoAdapter(context).request.path }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ path: "/test" });
  });

  test("method", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ method: new RequestContextHonoAdapter(context).request.method }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ method: "GET" });
  });

  test("url", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ url: new RequestContextHonoAdapter(context).request.url() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ url: "http://localhost/test" });
  });

  test("header", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ header: new RequestContextHonoAdapter(context).request.header("accept") }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ header: "application/json" });
  });

  test("headers", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ headers: new RequestContextHonoAdapter(context).request.headers() }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ headers: new Headers({ accept: "application/json" }).toJSON() });
  });

  test("headersObject", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ headersObject: new RequestContextHonoAdapter(context).request.headersObject() }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ headersObject: { accept: "application/json" } });
  });

  test("query", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ query: new RequestContextHonoAdapter(context).request.query() }),
    );

    const response = await app.request("/test?aaa=123&bbb=234");

    expect(await response.json()).toEqual({ query: { aaa: "123", bbb: "234" } });
  });

  test("params", async () => {
    const app = new Hono().get("/test/:id/:context", (context) =>
      context.json({ params: new RequestContextHonoAdapter(context).request.params() }),
    );

    const response = await app.request("/test/123/234");

    expect(await response.json()).toEqual({ params: { id: "123", context: "234" } });
  });

  test("param", async () => {
    const app = new Hono().get("/test/:id/:context", (context) =>
      context.json({ param: new RequestContextHonoAdapter(context).request.param("id") }),
    );

    const response = await app.request("/test/123/234");

    expect(await response.json()).toEqual({ param: "123" });
  });

  test("cookie", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ language: new RequestContextHonoAdapter(context).request.cookie("language") }),
    );

    const response = await app.request("/test", { headers: { cookie: "language=en" } });

    expect(await response.json()).toEqual({ language: "en" });
  });

  test("json", async () => {
    const app = new Hono().post("/test", async (context) =>
      context.json(await new RequestContextHonoAdapter(context).request.json()),
    );

    const response = await app.request("/test", {
      method: "POST",
      body: JSON.stringify({ reference: "abc" }),
    });

    expect(await response.json()).toEqual({ reference: "abc" });
  });

  test("json – invalid", async () => {
    const app = new Hono().post("/", async (context) =>
      context.json(await new RequestContextHonoAdapter(context).request.json()),
    );

    const response = await app.request("http://localhost/", { method: "POST", body: "{ invalid json" });

    expect(await response.json()).toEqual({});
  });

  test("text", async () => {
    const app = new Hono().post("/test", async (context) =>
      context.json({ text: await new RequestContextHonoAdapter(context).request.text() }),
    );

    const response = await app.request("/test", { method: "POST", body: "abc" });

    expect(await response.json()).toEqual({ text: "abc" });
  });

  test("text - empty", async () => {
    const app = new Hono().post("/test", async (context) =>
      context.json({ text: await new RequestContextHonoAdapter(context).request.text() }),
    );

    const response = await app.request("/test", { method: "POST" });

    expect(await response.json()).toEqual({ text: "" });
  });

  test("userId", async () => {
    const app = new Hono<Config>().get(
      "/test",
      async (context, next) => {
        // @ts-expect-error
        context.set("user", { id: mocks.user.id });
        await next();
      },
      (context) => context.json({ userId: new RequestContextHonoAdapter(context).identity.userId() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ userId: mocks.userId });
  });

  test("ip - x-real-ip", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-real-ip": "127.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("ip - x-forwarded-for - single", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-forwarded-for": "10.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - x-forwarded-for - multi", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-forwarded-for": "10.0.0.1 ,10.0.0.2" } });

    expect(await response.json()).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - getConnInfo", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", {}, mocks.connInfo);

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("ua", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ua: new RequestContextHonoAdapter(context).identity.ua() }),
    );

    const response = await app.request("/test", { headers: { "user-agent": "test-agent" } });

    expect(await response.json()).toEqual({ ua: "test-agent" });
  });
});
