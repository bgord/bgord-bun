import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorErrorStackHide } from "../src/redactor-error-stack-hide.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorErrorStackHide();

describe("RedactorErrorStackHide", () => {
  test("redact", () => {
    const error = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalError));

    expect(redactor.redact({ error })).toEqual({
      error: { ...mocks.IntentionalErrorNormalized, stack: undefined },
    });
  });

  test("redact - cause", () => {
    const cause = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalCause));
    const error = tools.ErrorNormalizer.normalize(new Error(mocks.IntentionalError));
    error.cause = cause;

    expect(redactor.redact({ error })).toEqual({
      error: {
        ...mocks.IntentionalErrorNormalized,
        stack: undefined,
        cause: { message: mocks.IntentionalCause, name: "Error" },
      },
    });
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
