import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { RequestContextExpressAdapter } from "../src/request-context-express.adapter";

describe("RequestContextExpressAdapter", () => {
  test("path", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ path: new RequestContextExpressAdapter(request).request.path }),
    );

    const response = await request(app).get("/test");

    expect(response.body).toEqual({ path: "/test" });
  });

  test("method", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ method: new RequestContextExpressAdapter(request).request.method }),
    );

    const response = await request(app).get("/test");

    expect(response.body).toEqual({ method: "GET" });
  });

  test("url", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ url: new RequestContextExpressAdapter(request).request.url() }),
    );

    const response = await request(app).get("/test");

    // Express with supertest binds to 127.0.0.1:<port>, unlike Hono's localhost
    expect(response.body.url).toContain("/test");
    expect(response.body.url).toMatch(/^http:\/\//);
  });

  test("header", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ header: new RequestContextExpressAdapter(request).request.header("accept") }),
    );

    const response = await request(app).get("/test").set("accept", "application/json");
    expect(response.body).toEqual({ header: "application/json" });
  });

  test("headers", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({
        headers: Object.fromEntries(new RequestContextExpressAdapter(request).request.headers().entries()),
      }),
    );

    const response = await request(app).get("/test").set("accept", "application/json");

    expect(response.body.headers).toMatchObject({ accept: "application/json" });
  });

  test("headersObject", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ headersObject: new RequestContextExpressAdapter(request).request.headersObject() }),
    );

    const response = await request(app).get("/test").set("accept", "application/json");

    expect(response.body.headersObject).toMatchObject({ accept: "application/json" });
  });

  test("query", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ query: new RequestContextExpressAdapter(request).request.query() }),
    );

    const response = await request(app).get("/test?aaa=123&bbb=234");

    expect(response.body).toEqual({ query: { aaa: "123", bbb: "234" } });
  });

  test("params", async () => {
    const app = express().get("/test/:id/:context", (request, response) =>
      response.json({ params: new RequestContextExpressAdapter(request).request.params() }),
    );

    const response = await request(app).get("/test/123/234");

    expect(response.body).toEqual({ params: { id: "123", context: "234" } });
  });

  test("cookie", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ language: new RequestContextExpressAdapter(request).request.cookie("language") }),
    );

    const response = await request(app).get("/test").set("cookie", "language=en");

    expect(response.body).toEqual({ language: "en" });
  });

  test("json", async () => {
    const app = express()
      .use(express.json())
      .post("/test", async (request, response) =>
        response.json(await new RequestContextExpressAdapter(request).request.json()),
      );

    const response = await request(app).post("/test").send({ reference: "abc" });

    expect(response.body).toEqual({ reference: "abc" });
  });

  test("json – invalid", async () => {
    const app = express()
      .use(express.json())
      .post("/", async (request, response) =>
        response.json(await new RequestContextExpressAdapter(request).request.json()),
      );

    await request(app).post("/").set("content-type", "application/json").send("{ invalid json").expect(400);
  });

  test("userId", async () => {
    const app = express().get(
      "/test",
      (request, _, next) => {
        (request as any).user = { id: 123 };
        next();
      },
      (request, response) =>
        response.json({ userId: new RequestContextExpressAdapter(request).identity.userId() }),
    );

    const response = await request(app).get("/test");

    expect(response.body).toEqual({ userId: 123 });
  });

  test("ip - x-real-ip", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ ip: new RequestContextExpressAdapter(request).identity.ip() }),
    );

    const response = await request(app).get("/test").set("x-real-ip", "127.0.0.1");

    expect(response.body).toEqual({ ip: "127.0.0.1" });
  });

  test("ip - x-forwarded-for", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ ip: new RequestContextExpressAdapter(request).identity.ip() }),
    );

    const response = await request(app).get("/test").set("x-forwarded-for", "10.0.0.1");

    expect(response.body).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - socket.remoteAddress", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ ip: new RequestContextExpressAdapter(request).identity.ip() }),
    );

    const response = await request(app).get("/test");

    expect(response.body.ip).toBeDefined();
  });

  test("ua", async () => {
    const app = express().get("/test", (request, response) =>
      response.json({ ua: new RequestContextExpressAdapter(request).identity.ua() }),
    );

    const response = await request(app).get("/test").set("user-agent", "test-agent");

    expect(response.body).toEqual({ ua: "test-agent" });
  });
});
