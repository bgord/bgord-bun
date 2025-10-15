import { describe, expect, test } from "bun:test";
import { RedactorMaskAdapter } from "../src/redactor-mask.adapter";

const redactor = new RedactorMaskAdapter(["password", "authorization", "x-api-key", "refreshToken"]);

describe("RedactorMaskAdapter", () => {
  test("happy path", () => {
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

  test("happy path - nested", () => {
    const input = { password: { nested: "x" }, authorization: 123, ok: true };

    // @ts-expect-error
    expect(redactor.redact(input)).toEqual({ password: "***", authorization: "***", ok: true });
  });
});
