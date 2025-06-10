import { describe, expect, spyOn, test } from "bun:test";

import * as NewUUIDModule from "../src/new-uuid.service";
import { UUID } from "../src/uuid.vo";

describe("UUID schema", () => {
  test("parses a valid UUID", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    const parsed = UUID.parse(validUUID);
    expect(parsed).toBe(validUUID);
  });

  test("throws on invalid UUID", () => {
    const invalidUUID = "not-a-uuid";
    expect(() => UUID.parse(invalidUUID)).toThrow();
  });

  test("uses NewUUID.generate() as default", () => {
    const fakeUUID = "11111111-2222-3333-4444-555555555555";

    const newUUIDGenerate = spyOn(NewUUIDModule.NewUUID, "generate").mockReturnValue(fakeUUID);

    const parsed = UUID.parse(undefined);
    expect(parsed).toBe(fakeUUID);
    expect(newUUIDGenerate).toHaveBeenCalled();

    newUUIDGenerate.mockRestore();
  });
});
