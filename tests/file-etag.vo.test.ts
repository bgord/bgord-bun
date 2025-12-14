import { describe, expect, test } from "bun:test";
import { FileEtag, FileEtagError } from "../src/file-etag.vo";

describe("FileEtag VO", () => {
  test("happy path", () => {
    expect(FileEtag.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => FileEtag.parse(null)).toThrow(FileEtagError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => FileEtag.parse(2024)).toThrow(FileEtagError.Type);
  });

  test("rejects empty", () => {
    expect(() => FileEtag.parse("")).toThrow(FileEtagError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => FileEtag.parse(`${"f".repeat(63)}x`)).toThrow(FileEtagError.InvalidHex);
  });
});
