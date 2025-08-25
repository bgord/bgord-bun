import { describe, expect, test } from "bun:test";
import { FilenameSuffixSchema } from "../src/filename-suffix.vo";

describe("FilenameSuffixSchema", () => {
  test("keeps valid characters as-is", () => {
    // @ts-expect-error
    expect(FilenameSuffixSchema.parse("-sm")).toBe("-sm");
    // @ts-expect-error
    expect(FilenameSuffixSchema.parse("_v2")).toBe("_v2");
    // @ts-expect-error
    expect(FilenameSuffixSchema.parse(" rc1 ")).toBe("rc1");
  });

  test("sanitizes by stripping disallowed characters", () => {
    // @ts-expect-error
    expect(FilenameSuffixSchema.parse(" /@!🙂 ")).toBe("");
  });

  test("enforces max length after sanitization", () => {
    const longSanitized = "x".repeat(33);
    expect(() => FilenameSuffixSchema.parse(longSanitized)).toThrow(/"suffix_too_long"/);

    const withinLimit = "x".repeat(32);
    // @ts-expect-error
    expect(FilenameSuffixSchema.parse(withinLimit)).toBe(withinLimit);
  });
});
