import { describe, expect, test } from "bun:test";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";

const redactor = new RedactorMaskStrategy(["password", "authorization", "x-api-key", "refreshToken"]);

describe("RedactorMaskStrategy", () => {
  test("happy path", async () => {
    const input = {
      meta: { headers: { Authorization: "Bearer abc.def.ghi", "x-api-key": "XYZ-123" } },
      nested: [{ refreshToken: "r1-r2-r3" }, { Secret: "should-stay" }],
      password: "supersecret",
    };

    expect(await redactor.redact(input)).toEqual({
      meta: { headers: { Authorization: "***", "x-api-key": "***" } },
      nested: [{ refreshToken: "***" }, { Secret: "should-stay" }],
      password: "***",
    });
  });

  test("happy path - nested", async () => {
    const input = { password: { nested: "x" }, authorization: 123, ok: true };

    // @ts-expect-error
    expect(await redactor.redact(input)).toEqual({ password: "***", authorization: "***", ok: true });
  });
});
