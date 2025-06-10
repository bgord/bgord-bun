import { describe, expect, spyOn, test } from "bun:test";

import { NewUUID } from "../src/new-uuid.service";

describe("New UUID", () => {
  test("NewUUID.generate returns a valid UUID", () => {
    const uuid = NewUUID.generate();

    // Basic UUID v4 format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(uuid).toMatch(uuidRegex);
  });

  test("NewUUID.generate calls crypto.randomUUID", () => {
    const cryptoRandomUUID = spyOn(crypto, "randomUUID");

    NewUUID.generate();

    expect(cryptoRandomUUID).toHaveBeenCalled();

    cryptoRandomUUID.mockRestore();
  });
});
