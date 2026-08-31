import { describe, expect, test } from "bun:test";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";

const strategy = new ErrorClassifierMessageMapStrategy({
  "revision.mismatch": { message: "revision.mismatch", status: 412 },
  "mime.value.invalid": { message: "invalid.mime", status: 400 },
});

describe("ErrorClassifierMessageMapStrategy", () => {
  test("happy path", async () => {
    const result = strategy.classify(new Error("revision.mismatch"));

    expect(result?.status).toEqual(412);
    expect(await result?.json()).toEqual({ message: "revision.mismatch" });
  });

  test("unmapped message", () => {
    expect(strategy.classify(new Error("date.range.invalid"))).toEqual(null);
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });
});
