import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheControlMustRevalidateStrategy } from "../src/cache-control-must-revalidate.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const strategy = new CacheControlMustRevalidateStrategy(tools.Duration.Minutes(5));

describe("CacheControlMustRevalidateStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withPath("/main.css").build();

    expect(strategy.resolve(context)).toEqual("public, max-age=300, must-revalidate");
  });
});
