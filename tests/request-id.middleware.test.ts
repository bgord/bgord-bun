import { describe, expect, test } from "bun:test";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { RequestIdMiddleware } from "../src/request-id.middleware";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const valid = "550e8400-e29b-41d4-a716-446655440000";
const invalid = "not-a-valid-uuid";

const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
const middleware = new RequestIdMiddleware({ IdProvider });

describe("RequestIdMiddleware", () => {
  test("no incoming", () => {
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(mocks.correlationId);
  });

  test("incoming - correct", () => {
    const context = new RequestContextBuilder().withHeader(RequestIdMiddleware.HEADER_NAME, valid).build();

    expect(middleware.evaluate(context)).toEqual(valid);
  });

  test("incoming - incorrect", () => {
    const context = new RequestContextBuilder().withHeader(RequestIdMiddleware.HEADER_NAME, invalid).build();

    expect(middleware.evaluate(context)).toEqual(mocks.correlationId);
  });
});
