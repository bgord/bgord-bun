import { describe, expect, test } from "bun:test";
import { UUID } from "../src/uuid.vo";

describe("UUID schema", () => {
  test("parses a valid UUID", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    const parsed = UUID.parse(validUUID);

    expect(parsed).toEqual(validUUID);
  });

  test("throws on invalid UUID", () => {
    expect(() => UUID.parse("not-a-uuid")).toThrow();
  });
});
