import { describe, expect, test } from "bun:test";
import { TrailingSlashMiddleware } from "../src/trailing-slash.middleware";
import { RequestContextBuilder } from "./request-context-builder";

const middleware = new TrailingSlashMiddleware();

describe("TrailingSlashMiddleware", () => {
  test("no redirect - no trailing slash", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/data").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: false });
  });

  test("no redirect - root path", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: false });
  });

  test("redirect - trailing slash", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/data/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data", status: 308 });
  });

  test("redirect - nested path with trailing slash", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/api/users/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/api/users", status: 308 });
  });

  test("redirect - multiple segments", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/api/v1/users/123/").build();

    expect(middleware.evaluate(context)).toEqual({
      redirect: true,
      pathname: "/api/v1/users/123",
      status: 308,
    });
  });

  test("redirect - two trailing slashes", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/data//").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data", status: 308 });
  });

  test("redirect - three trailing slashes", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/data///").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data", status: 308 });
  });

  test("redirect - root path with extra trailing slashes", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost//").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/", status: 308 });
  });

  test("redirect - no protocol-relative location", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost//evil.com/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/evil.com", status: 308 });
  });

  test("redirect - no backslash location", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/%5Cevil.com/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/%5Cevil.com", status: 308 });
  });

  test("redirect - no tab location", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/%09/evil.com/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/%09/evil.com", status: 308 });
  });

  test("redirect - collapses leading slashes only", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/data//path/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data//path", status: 308 });
  });

  test("redirect - no host header in the location", async () => {
    const context = new RequestContextBuilder()
      .withUrl("http://localhost/data/")
      .withHeader("host", "evil.example")
      .build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/data", status: 308 });
  });

  test("redirect - preserves percent-encoding", () => {
    const context = new RequestContextBuilder().withUrl("http://localhost/caf%C3%A9/").build();

    expect(middleware.evaluate(context)).toEqual({ redirect: true, pathname: "/caf%C3%A9", status: 308 });
  });
});
