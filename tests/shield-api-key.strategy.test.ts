import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ShieldApiKeyStrategy } from "../src/shield-api-key.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const strategy = new ShieldApiKeyStrategy({ API_KEY: tools.ApiKey.parse(VALID_API_KEY) });

describe("ShieldApiKeyStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder()
      .withHeader(ShieldApiKeyStrategy.HEADER_NAME, VALID_API_KEY)
      .build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("denied - no api key", () => {
    const context = new RequestContextBuilder().withHeader(ShieldApiKeyStrategy.HEADER_NAME, "").build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid api key", () => {
    const context = new RequestContextBuilder()
      .withHeader(ShieldApiKeyStrategy.HEADER_NAME, INVALID_API_KEY)
      .build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
