import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { BodyLimitHonoMiddleware } from "../src/body-limit-hono.middleware";

const maxSize = tools.Size.fromKb(100);
const middleware = new BodyLimitHonoMiddleware({ maxSize });

const app = new Hono().use(middleware.handle()).post("/upload", (c) => c.text("ok"));

describe("BodyLimitHonoMiddleware", () => {
  test("happy path - no header", async () => {
    const response = await app.request("/upload", { method: "POST" });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("allows request - within limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": tools.Size.fromKb(0).toBytes().toString() },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("happy path - below limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": tools.Size.fromKb(50).toBytes().toString() },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("happy path - at the limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": maxSize.toBytes().toString() },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("over the limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": tools.Size.fromKb(101).toBytes().toString() },
    });

    expect(response.status).toEqual(413);
    expect(await response.text()).toEqual("body.limit.rejected");
  });

  test("invalid header", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": "invalid" },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("negative header", async () => {
    const response = await app.request("/upload", { method: "POST", headers: { "content-length": "-100" } });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });
});
