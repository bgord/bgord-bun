import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { TrailingSlashExpressMiddleware } from "../src/trailing-slash-express.middleware";

const middleware = new TrailingSlashExpressMiddleware();

const app = express()
  .use(middleware.handle())
  .get("/data", (_request, response) => response.send("ok"));

describe("TrailingSlashExpressMiddleware", () => {
  test("no redirect - no trailing slash", async () => {
    const response = await request(app).get("/data");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("no redirect - root path", async () => {
    const app = express()
      .use(middleware.handle())
      .get("/", (_request, response) => response.send("root"));

    const response = await request(app).get("/");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("root");
  });

  test("redirect - trailing slash", async () => {
    const response = await request(app).get("/data/");

    expect(response.status).toEqual(301);
    expect(response.headers.location).toContain("/data");
  });

  test("redirect - nested path with trailing slash", async () => {
    const app = express()
      .use(middleware.handle())
      .get("/api/users", (_request, response) => response.send("ok"));

    const response = await request(app).get("/api/users/");

    expect(response.status).toEqual(301);
    expect(response.headers.location).toContain("/api/users");
  });

  test("redirect - preserves query string", async () => {
    const response = await request(app).get("/data/?page=1");

    expect(response.status).toEqual(301);
    expect(response.headers.location).toContain("/data?page=1");
  });
});
