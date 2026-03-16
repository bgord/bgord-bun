import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { UUID } from "../src/uuid.vo";

describe("UUID", () => {
  test("happy path", () => {
    expect(v.safeParse(UUID, "123e4567-e89b-12d3-a456-426614174000").success).toEqual(true);
  });

  test("rejects invalid", () => {
    expect(() => v.parse(UUID, "not-a-uuid")).toThrow("uuid.type");
  });
});
