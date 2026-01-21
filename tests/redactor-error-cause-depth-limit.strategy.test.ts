import { describe, expect, test } from "bun:test";
import type { NormalizedError } from "../src/error-normalizer.service";
import { RedactorErrorCauseDepthLimitStrategy } from "../src/redactor-error-cause-depth-limit.strategy";

const redactor = new RedactorErrorCauseDepthLimitStrategy(1);

describe("RedactorLimitErrorCauseDepthStrategy", () => {
  test("limit - above", () => {
    const input: NormalizedError = {
      message: "level 0",
      name: "Error",
      stack: "stack0",
      cause: { message: "level 1", cause: { message: "level 2" } },
    };

    expect(redactor.redact(input)).toEqual({
      message: "level 0",
      name: "Error",
      stack: "stack0",
      cause: { message: "level 1" },
    });
  });

  test("limit - below", () => {
    const input: NormalizedError = { message: "root", cause: { message: "child" } };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop", () => {
    const value = { foo: "bar" };

    expect(redactor.redact(value)).toEqual(value);
  });
});
