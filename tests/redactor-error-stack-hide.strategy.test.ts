import { describe, expect, test } from "bun:test";
import type { NormalizedError } from "../src/error-normalizer.service";
import { RedactorErrorStackHideStrategy } from "../src/redactor-error-stack-hide.strategy";

const redactor = new RedactorErrorStackHideStrategy();

describe("RedactorErrorStackHideStrategy", () => {
  test("stack", () => {
    const input: NormalizedError = { message: "boom", name: "Error", stack: "stack trace" };

    expect(redactor.redact(input)).toEqual({ message: "boom", name: "Error" });
  });

  test("cause - stack", () => {
    const input: NormalizedError = {
      message: "outer",
      stack: "outer stack",
      cause: { message: "inner", stack: "inner stack" },
    };

    expect(redactor.redact(input)).toEqual({ message: "outer", cause: { message: "inner" } });
  });

  test("noop", () => {
    const input = { foo: "bar", stack: "not an error" };

    expect(redactor.redact(input)).toEqual(input);
  });
});
