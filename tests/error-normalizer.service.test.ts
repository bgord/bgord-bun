import { describe, expect, test } from "bun:test";
import { ErrorNormalizer } from "../src/error-normalizer.service";
import * as mocks from "./mocks";

describe("ErrorNormalizer", () => {
  test("error instance", () => {
    const result = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: undefined,
    });
  });

  test("error instance - cause - error", () => {
    const error = new Error(mocks.IntentionalError, { cause: new Error("cause") });

    const result = ErrorNormalizer.normalize(error);

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { name: "Error", message: "cause", stack: expect.any(String), cause: undefined },
    });
  });

  test("error instance - cause - string", () => {
    const result = ErrorNormalizer.normalize(new Error(mocks.IntentionalError, { cause: "root" }));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { message: "root" },
    });
  });

  test("string", () => {
    const result = ErrorNormalizer.normalize("Something has crashed");

    expect(result).toEqual({ message: "Something has crashed" });
  });

  test("number", () => {
    const result = ErrorNormalizer.normalize(123);

    expect(result).toEqual({ message: "123" });
  });
});
