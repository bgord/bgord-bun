import { describe, expect, test } from "bun:test";
import { ErrorNormalizer } from "../src/error-normalizer.service";
import * as mocks from "./mocks";

describe("ErrorNormalizer", () => {
  test("normalize - error instance", () => {
    const result = ErrorNormalizer.normalize(new Error(mocks.IntentionalError));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: undefined,
    });
  });

  test("normalize - error instance - cause - error", () => {
    const error = new Error(mocks.IntentionalError, { cause: new Error("cause") });

    const result = ErrorNormalizer.normalize(error);

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { name: "Error", message: "cause", stack: expect.any(String), cause: undefined },
    });
  });

  test("normalize - error instance - cause - string", () => {
    const result = ErrorNormalizer.normalize(new Error(mocks.IntentionalError, { cause: "root" }));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { message: "root" },
    });
  });

  test("normalize - string", () => {
    const result = ErrorNormalizer.normalize("Something has crashed");

    expect(result).toEqual({ message: "Something has crashed" });
  });

  test("normalize - number", () => {
    const result = ErrorNormalizer.normalize(123);

    expect(result).toEqual({ message: "123" });
  });

  test("normalize - undefined", () => {
    const result = ErrorNormalizer.normalize(undefined);

    expect(result).toEqual({ message: "undefined" });
  });

  test("normalize - null", () => {
    const result = ErrorNormalizer.normalize(null);

    expect(result).toEqual({ message: "null" });
  });

  test("normalize - circular error", () => {
    const error = new Error(mocks.IntentionalError);
    (error as any).cause = error;

    const normalized = ErrorNormalizer.normalize(error);

    expect(normalized).toEqual({
      message: mocks.IntentionalError,
      name: "Error",
      cause: { message: mocks.IntentionalError, name: "Error" },
      stack: expect.any(String),
    });
  });

  test("isNormalizedError - happy path", () => {
    const error = new Error(mocks.IntentionalError);
    const result = ErrorNormalizer.isNormalizedError(ErrorNormalizer.normalize(error));

    expect(result).toEqual(true);
  });

  test("isNormalizedError - not an object", () => {
    expect(ErrorNormalizer.isNormalizedError(5)).toEqual(false);
    expect(ErrorNormalizer.isNormalizedError(null)).toEqual(false);
    expect(ErrorNormalizer.isNormalizedError(undefined)).toEqual(false);
  });

  test("isNormalizedError - without message", () => {
    expect(ErrorNormalizer.isNormalizedError({ code: "critical" })).toEqual(false);
  });

  test("isNormalizedError - message not a string", () => {
    expect(ErrorNormalizer.isNormalizedError({ message: 5 })).toEqual(false);
  });
});
