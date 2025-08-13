import { describe, expect, test } from "bun:test";
import { CorrelationId, CorrelationIdType } from "../src/correlation-id.vo";

describe("CorrelationId", () => {
  test("CorrelationId accepts a valid UUID", () => {
    const uuid = crypto.randomUUID() as CorrelationIdType;
    const result = CorrelationId.parse(uuid);

    expect(result).toBe(uuid);
  });

  test("CorrelationId rejects an invalid UUID", () => {
    expect(() => CorrelationId.parse("not-a-uuid")).toThrow();
  });
});
