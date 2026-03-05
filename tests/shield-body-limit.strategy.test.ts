import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ShieldBodyLimitStrategy } from "../src/shield-body-limit.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const maxSize = tools.Size.fromKb(100);
const shield = new ShieldBodyLimitStrategy({ maxSize });

describe("ShieldBodyLimitStrategy", () => {
  test("happy path - no header", () => {
    const context = new RequestContextBuilder().build();

    expect(shield.evaluate(context)).toEqual(true);
  });

  test("happy path - below limit", () => {
    const context = new RequestContextBuilder()
      .withHeader("content-length", tools.Size.fromKb(50).toBytes().toString())
      .build();

    expect(shield.evaluate(context)).toEqual(true);
  });

  test("happy path - at the limit", () => {
    const context = new RequestContextBuilder()
      .withHeader("content-length", maxSize.toBytes().toString())
      .build();

    expect(shield.evaluate(context)).toEqual(true);
  });

  test("over the limit", () => {
    const context = new RequestContextBuilder()
      .withHeader("content-length", tools.Size.fromKb(101).toBytes().toString())
      .build();

    expect(shield.evaluate(context)).toEqual(false);
  });

  test("invalid header", () => {
    const context = new RequestContextBuilder().withHeader("content-length", "invalid").build();

    expect(shield.evaluate(context)).toEqual(true);
  });

  test("negative header", () => {
    const context = new RequestContextBuilder().withHeader("content-length", "-100").build();

    expect(shield.evaluate(context)).toEqual(true);
  });
});
