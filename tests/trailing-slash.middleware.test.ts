import { describe, expect, test } from "bun:test";
import { TrailingSlashMiddleware } from "../src/trailing-slash.middleware";
import { RequestContextBuilder } from "./request-context-builder";

const middleware = new TrailingSlashMiddleware();

describe("TrailingSlashMiddleware", () => {
  test("no redirect - no trailing slash", () => {
    const context = new RequestContextBuilder().withPath("/data").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: false });
  });

  test("no redirect - root path", () => {
    const context = new RequestContextBuilder().withPath("/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: false });
  });

  test("redirect - trailing slash", () => {
    const context = new RequestContextBuilder().withPath("/data/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data" });
  });

  test("redirect - nested path with trailing slash", () => {
    const context = new RequestContextBuilder().withPath("/api/users/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/api/users" });
  });

  test("redirect - multiple segments", () => {
    const context = new RequestContextBuilder().withPath("/api/v1/users/123/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/api/v1/users/123" });
  });
});
