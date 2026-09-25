import { describe, expect, test } from "bun:test";
import { CacheControlNoopStrategy } from "../src/cache-control-noop.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const strategy = new CacheControlNoopStrategy();

describe("CacheControlNoopStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withPath("/main.css").build();

    expect(strategy.resolve(context)).toEqual(null);
  });
});
