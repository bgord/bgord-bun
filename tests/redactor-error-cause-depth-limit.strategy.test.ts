import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorErrorCauseDepthLimit } from "../src/redactor-error-cause-depth-limit.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorErrorCauseDepthLimit(tools.Int.nonNegative(1));

describe("RedactorErrorCauseDepthLimit", () => {
  test("redact - above limit", () => {
    const cause = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalCause));
    const error = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalError));
    error.cause = cause;

    expect(redactor.redact({ error })).toEqual({
      error: {
        ...mocks.IntentionalErrorNormalized,
        cause: { message: mocks.IntentionalCause, name: "Error", stack: expect.any(String) },
      },
    });
  });

  test("redact - at the limit", () => {
    const cause = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalCause));
    const error = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalError));
    error.cause = cause;

    expect(redactor.redact({ error })).toEqual({ error });
  });

  test("redact - noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - no error property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - not normalized error", () => {
    const input = { error: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });
});
