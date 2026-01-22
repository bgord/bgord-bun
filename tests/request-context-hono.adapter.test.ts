import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { RequestContextAdapterHono } from "../src/request-context-hono.adapter";
import * as mocks from "./mocks";

describe("RequestContextAdapterHono", () => {
  test("path", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ path: new RequestContextAdapterHono(context).request.path }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ path: "/test" });
  });

  test("header", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ header: new RequestContextAdapterHono(context).request.header("accept") }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ header: "application/json" });
  });

  test("query", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ query: new RequestContextAdapterHono(context).request.query() }),
    );

    const response = await app.request("/test?aaa=123&bbb=234");

    expect(await response.json()).toEqual({ query: { aaa: "123", bbb: "234" } });
  });

  test("cookie", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ language: new RequestContextAdapterHono(context).request.cookie("language") }),
    );

    const response = await app.request("/test", { headers: { cookie: "language=en" } });

    expect(await response.json()).toEqual({ language: "en" });
  });

  test("json", async () => {
    const app = new Hono().post("/test", async (context) =>
      context.json(await new RequestContextAdapterHono(context).request.json()),
    );

    const response = await app.request("/test", {
      method: "POST",
      body: JSON.stringify({ reference: "abc" }),
    });

    expect(await response.json()).toEqual({ reference: "abc" });
  });

  test("json – invalid", async () => {
    const app = new Hono().post("/", async (context) =>
      context.json(await new RequestContextAdapterHono(context).request.json()),
    );

    const response = await app.request("http://localhost/", { method: "POST", body: "{ invalid json" });

    expect(await response.json()).toEqual({});
  });

  test("userId", async () => {
    const app = new Hono<{ Variables: { user: { id: number } } }>().get(
      "/test",
      async (context, next) => {
        context.set("user", { id: 123 });
        await next();
      },
      (context) => context.json({ userId: new RequestContextAdapterHono(context).identity.userId() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ userId: 123 });
  });

  test("ip - x-real-ip", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextAdapterHono(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-real-ip": "127.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("ip - x-forwarded-for", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextAdapterHono(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-forwarded-for": "10.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - getConnInfo", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ip: new RequestContextAdapterHono(context).identity.ip() }),
    );

    const response = await app.request("/test", {}, mocks.connInfo);

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("ua", async () => {
    const app = new Hono().get("/test", (context) =>
      context.json({ ua: new RequestContextAdapterHono(context).identity.ua() }),
    );

    const response = await app.request("/test", { headers: { "user-agent": "test-agent" } });

    expect(await response.json()).toEqual({ ua: "test-agent" });
  });
});
