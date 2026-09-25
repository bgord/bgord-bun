import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheControlImmutableStrategy } from "../src/cache-control-immutable.strategy";
import { CacheControlMustRevalidateStrategy } from "../src/cache-control-must-revalidate.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const strategy = new CacheControlImmutableStrategy(
  new CacheControlMustRevalidateStrategy(tools.Duration.Minutes(5)),
);

describe("CacheControlImmutableStrategy", () => {
  test("hashed", () => {
    const context = new RequestContextBuilder().withPath("/main-a1b2c3d4.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=31536000, immutable");
  });

  test("hashed - nested", () => {
    const context = new RequestContextBuilder().withPath("/assets/main-a1b2c3d4.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=31536000, immutable");
  });

  test("versioned", () => {
    const context = new RequestContextBuilder().withPath("/main.css").withQuery({ v: "123" }).build();

    expect(strategy.resolve(context)).toEqual("public, max-age=31536000, immutable");
  });

  test("fallback", () => {
    const context = new RequestContextBuilder().withPath("/main.css").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - empty version", () => {
    const context = new RequestContextBuilder().withPath("/main.css").withQuery({ v: "" }).build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash too short", () => {
    const context = new RequestContextBuilder().withPath("/main-a1b2c3d.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash too long", () => {
    const context = new RequestContextBuilder().withPath("/main-a1b2c3d4e.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash uppercase", () => {
    const context = new RequestContextBuilder().withPath("/main-A1B2C3D4.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash without dash", () => {
    const context = new RequestContextBuilder().withPath("/main.a1b2c3d4.js").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hashed not js", () => {
    const context = new RequestContextBuilder().withPath("/main-a1b2c3d4.css").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hashed js not at end", () => {
    const context = new RequestContextBuilder().withPath("/main-a1b2c3d4.js.map").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });
});
