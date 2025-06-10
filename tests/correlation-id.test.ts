import { describe, expect, test } from "bun:test";

import { CorrelationId, CorrelationIdType } from "../src/correlation-id";
import { NewUUID } from "../src/new-uuid.service";

describe("CorrelationId", () => {
  test("CorrelationId accepts a valid UUID", () => {
    const uuid = NewUUID.generate() as CorrelationIdType;
    const result = CorrelationId.parse(uuid);

    expect(result).toBe(uuid);
  });

  test("CorrelationId rejects an invalid UUID", () => {
    expect(() => CorrelationId.parse("not-a-uuid")).toThrow();
  });
});
