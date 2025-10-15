import { describe, expect, test } from "bun:test";
import { UUID, UUIDError } from "../src/uuid.vo";

describe("UUID VO", () => {
  test("happy path", () => {
    expect(UUID.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toEqual(true);
  });

  test("rejects invalid", () => {
    expect(() => UUID.parse("not-a-uuid")).toThrow(UUIDError.Type);
  });
});
