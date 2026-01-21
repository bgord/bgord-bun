import { describe, expect, test } from "bun:test";
import { ErrorNormalizer } from "../src/error-normalizer.service";
import { RedactorErrorStackHideStrategy } from "../src/redactor-error-stack-hide.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorErrorStackHideStrategy();

describe("RedactorErrorStackHideStrategy", () => {
  test("stack", () => {
    const error = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));

    expect(redactor.redact({ error })).toEqual({
      error: { message: mocks.IntentionalError, name: "Error", cause: undefined, stack: undefined },
    });
  });

  test("stack - cause", () => {
    const IntentionalCause = "intentional.cause";
    const cause = ErrorNormalizer.normalize(new Error(IntentionalCause));
    const error = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));
    error.cause = cause;

    expect(redactor.redact({ error })).toEqual({
      error: {
        message: mocks.IntentionalError,
        name: "Error",
        cause: { message: IntentionalCause, name: "Error", stack: undefined, cause: undefined },
        stack: undefined,
      },
    });
  });

  test("noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - no error property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });
});
