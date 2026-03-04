import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { TrailingSlashHonoMiddleware } from "../src/trailing-slash-hono.middleware";

const middleware = new TrailingSlashHonoMiddleware();

const app = new Hono().use(middleware.handle()).get("/data", (c) => c.text("ok"));

describe("TrailingSlashHonoMiddleware", () => {
  test("no redirect - no trailing slash", async () => {
    const response = await app.request("/data");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("no redirect - root path", async () => {
    const app = new Hono().use(middleware.handle()).get("/", (c) => c.text("root"));

    const response = await app.request("/");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("root");
  });

  test("redirect - trailing slash", async () => {
    const response = await app.request("/data/");

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/data");
  });

  test("redirect - nested path with trailing slash", async () => {
    const app = new Hono().use(middleware.handle()).get("/api/users", (c) => c.text("ok"));

    const response = await app.request("/api/users/");

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/api/users");
  });

  test("redirect - preserves query string", async () => {
    const response = await app.request("/data/?page=1");

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/data?page=1");
  });

  test("redirect - preserves hash", async () => {
    const response = await app.request("/data/#section");

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/data#section");
  });

  test("redirect - preserves query and hash", async () => {
    const response = await app.request("/data/?page=1#section");

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/data?page=1#section");
  });
});
