import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { ApiVersionHonoNoopMiddleware } from "../src/api-version-hono-noop.middleware";

const version = "1.2.3";

const middleware = new ApiVersionHonoNoopMiddleware(tools.PackageVersion.fromString(version));
const app = new Hono().use(middleware.handle()).get("/ping", (c) => c.text("OK"));

describe("ApiVersionHonoNoopMiddleware", async () => {
  test("happy path", async () => {
    const response = await app.request("/ping", { method: "GET" });

    expect(response.status).toEqual(200);
    expect(response.headers.get(ApiVersionMiddleware.HEADER_NAME)).toEqual(version);
  });
});
