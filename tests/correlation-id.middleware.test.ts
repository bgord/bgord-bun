import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationIdMiddleware } from "../src/correlation-id.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const valid = "550e8400-e29b-41d4-a716-446655440000";
const invalid = "not-a-valid-uuid";

describe("CorrelationIdMiddleware", () => {
  test("no incoming", () => {
    const context = new RequestContextBuilder().build();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const middleware = new CorrelationIdMiddleware({ IdProvider });

    expect(middleware.evaluate(context)).toEqual(mocks.correlationId);
  });

  test("incoming - correct", () => {
    const context = new RequestContextBuilder()
      .withHeader(CorrelationIdMiddleware.HEADER_NAME, valid)
      .build();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const middleware = new CorrelationIdMiddleware({ IdProvider });

    expect(middleware.evaluate(context)).toEqual(valid);
  });

  test("incoming - incorrect", () => {
    const context = new RequestContextBuilder()
      .withHeader(CorrelationIdMiddleware.HEADER_NAME, invalid)
      .build();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const middleware = new CorrelationIdMiddleware({ IdProvider });

    expect(middleware.evaluate(context)).toEqual(mocks.correlationId);
  });
});
