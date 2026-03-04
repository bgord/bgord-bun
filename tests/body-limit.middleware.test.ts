import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BodyLimitMiddleware } from "../src/body-limit.middleware";

const maxSize = tools.Size.fromKb(100);
const middleware = new BodyLimitMiddleware({ maxSize });

describe("BodyLimitMiddleware", () => {
  test("happy path - no header", () => {
    expect(middleware.evaluate(undefined)).toEqual(true);
  });

  test("happy path - zero", () => {
    const contentLength = tools.IntegerNonNegative.parse(0);

    expect(middleware.evaluate(contentLength)).toEqual(true);
  });

  test("happy path - below limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(tools.Size.fromKb(50).toBytes());

    expect(middleware.evaluate(contentLength)).toEqual(true);
  });

  test("happy path - at the limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(maxSize.toBytes());

    expect(middleware.evaluate(contentLength)).toEqual(true);
  });

  test("over the limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(tools.Size.fromKb(101).toBytes());

    expect(middleware.evaluate(contentLength)).toEqual(false);
  });
});
