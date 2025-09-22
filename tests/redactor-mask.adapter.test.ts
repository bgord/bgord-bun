import { describe, expect, test } from "bun:test";
import { RedactorMaskAdapter } from "../src/redactor-mask.adapter";

describe("RedactorMaskAdapter", () => {
  test("masks matching keys at any depth (case-insensitive)", () => {
    const redactor = new RedactorMaskAdapter(["password", "authorization", "x-api-key", "refreshToken"]);

    const input = {
      meta: { headers: { Authorization: "Bearer abc.def.ghi", "x-api-key": "XYZ-123" } },
      nested: [{ refreshToken: "r1-r2-r3" }, { Secret: "should-stay" }],
      password: "supersecret",
    };

    expect(redactor.redact(input)).toEqual({
      meta: { headers: { Authorization: "***", "x-api-key": "***" } },
      nested: [{ refreshToken: "***" }, { Secret: "should-stay" }],
      password: "***",
    });
  });

  test("preserves structure for arrays/objects and only replaces values", () => {
    const redactor = new RedactorMaskAdapter(["token"]);
    const input = { a: [{ token: "t1", x: [1, { token: "t2" }] }], b: 42 };

    expect(redactor.redact(input)).toEqual({ a: [{ token: "***", x: [1, { token: "***" }] }], b: 42 });
  });

  test("replaces non-string values under sensitive keys with the placeholder", () => {
    const redactor = new RedactorMaskAdapter(["secret", "count"]);
    const input = { secret: { nested: "x" }, count: 123, ok: true };

    // @ts-expect-error
    expect(redactor.redact(input)).toEqual({ secret: "***", count: "***", ok: true });
  });
});
