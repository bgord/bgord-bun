import { describe, expect, test } from "bun:test";
import { ShieldCsrfStrategy } from "../src/shield-csrf.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const APP_ORIGIN = "http://localhost:3000";
const EVIL_ORIGIN = "https://evil.example";

const strategy = new ShieldCsrfStrategy({ origin: [APP_ORIGIN] });

describe("ShieldCsrfStrategy", () => {
  test("safe method - allowed - no origin", () => {
    const context = new RequestContextBuilder().withMethod("GET").build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("safe method - allowed - good origin", () => {
    const context = new RequestContextBuilder().withMethod("GET").withHeader("origin", APP_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("safe method - allowed - bad origin", () => {
    const context = new RequestContextBuilder().withMethod("GET").withHeader("origin", EVIL_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("state-changing - allowed - no origin", () => {
    const context = new RequestContextBuilder().withMethod("POST").build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("state-changing - allowed - good origin", () => {
    const context = new RequestContextBuilder().withMethod("POST").withHeader("origin", APP_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("state-changing - POST - not allowed - wrong origin", () => {
    const context = new RequestContextBuilder().withMethod("POST").withHeader("origin", EVIL_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("state-changing - PUT - not allowed - wrong origin", () => {
    const context = new RequestContextBuilder().withMethod("PUT").withHeader("origin", EVIL_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("state-changing - PATCH - not allowed - wrong origin", () => {
    const context = new RequestContextBuilder().withMethod("PATCH").withHeader("origin", EVIL_ORIGIN).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("state-changing - DELETE - not allowed - wrong origin", () => {
    const context = new RequestContextBuilder()
      .withMethod("DELETE")
      .withHeader("origin", EVIL_ORIGIN)
      .build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
