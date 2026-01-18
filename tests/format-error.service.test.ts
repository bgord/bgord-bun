import { describe, expect, test } from "bun:test";
import { formatError } from "../src/format-error.service";
import * as mocks from "./mocks";

describe("formatError", () => {
  test("error instance", () => {
    const result = formatError(new Error(mocks.IntentionalError));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: undefined,
    });
  });

  test("error instance - cause - error", () => {
    const error = new Error(mocks.IntentionalError, { cause: new Error("cause") });

    const result = formatError(error);

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { name: "Error", message: "cause", stack: expect.any(String), cause: undefined },
    });
  });

  test("error instance - cause - string", () => {
    const result = formatError(new Error(mocks.IntentionalError, { cause: "root" }));

    expect(result).toEqual({
      name: "Error",
      message: mocks.IntentionalError,
      stack: expect.any(String),
      cause: { message: "root" },
    });
  });

  test("string", () => {
    const result = formatError("Something has crashed");

    expect(result).toEqual({ message: "Something has crashed" });
  });

  test("number", () => {
    const result = formatError(123);

    expect(result).toEqual({ message: "123" });
  });
});
