import { describe, expect, test } from "bun:test";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";

const redactor = new RedactorNoopAdapter();

describe("RedactorNoopAdapter", () => {
  test("happy path", () => {
    const input = {
      meta: { headers: { Authorization: "Bearer abc.def.ghi", "x-api-key": "XYZ-123" } },
      nested: [{ refreshToken: "r1-r2-r3" }, { Secret: "should-stay" }],
      password: "supersecret",
    };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("happy path - nested", () => {
    const input = { password: { nested: "x" }, authorization: 123, ok: true };

    expect(redactor.redact(input)).toEqual(input);
  });
});
