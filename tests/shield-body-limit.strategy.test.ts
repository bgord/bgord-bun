import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ShieldBodyLimitStrategy } from "../src/shield-body-limit.strategy";

const maxSize = tools.Size.fromKb(100);
const shield = new ShieldBodyLimitStrategy({ maxSize });

describe("ShieldBodyLimitStrategy", () => {
  test("happy path - no header", () => {
    expect(shield.evaluate(undefined)).toEqual(true);
  });

  test("happy path - zero", () => {
    const contentLength = tools.IntegerNonNegative.parse(0);

    expect(shield.evaluate(contentLength)).toEqual(true);
  });

  test("happy path - below limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(tools.Size.fromKb(50).toBytes());

    expect(shield.evaluate(contentLength)).toEqual(true);
  });

  test("happy path - at the limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(maxSize.toBytes());

    expect(shield.evaluate(contentLength)).toEqual(true);
  });

  test("over the limit", () => {
    const contentLength = tools.IntegerNonNegative.parse(tools.Size.fromKb(101).toBytes());

    expect(shield.evaluate(contentLength)).toEqual(false);
  });
});
