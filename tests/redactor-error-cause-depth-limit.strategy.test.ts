import { describe, expect, test } from "bun:test";
import { ErrorNormalizer } from "../src/error-normalizer.service";
import { RedactorErrorCauseDepthLimitStrategy } from "../src/redactor-error-cause-depth-limit.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorErrorCauseDepthLimitStrategy(1);

describe("RedactorLimitErrorCauseDepthStrategy", () => {
  test("limit - above", () => {
    const IntentionalCause = "intentional.cause";
    const cause = ErrorNormalizer.normalize(new Error(IntentionalCause));
    const error = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));
    error.cause = cause;

    expect(redactor.redact({ error })).toEqual({
      error: {
        message: mocks.IntentionalError,
        name: "Error",
        stack: expect.any(String),
        cause: { message: IntentionalCause, name: "Error", stack: expect.any(String), cause: undefined },
      },
    });
  });

  test("limit - below", () => {
    const error = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));

    expect(redactor.redact({ error })).toEqual({ error });
  });

  test("noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - no error property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - not normalized error", () => {
    const input = { error: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });
});
