import { describe, expect, test } from "bun:test";
import { ZodError } from "zod/v4";
import { FilenameFromStringSchema } from "../src/filename-from-string.vo";

describe("FilenameFromStringSchema (minimal)", () => {
  test("parses valid 'name.ext' and normalizes extension", () => {
    const parsed = FilenameFromStringSchema.parse("avatar.WEBP");
    // @ts-expect-error
    expect(parsed.basename).toBe("avatar");
    // @ts-expect-error
    expect(parsed.extension).toBe("webp"); // normalized by ExtensionSchema
  });

  test("trims and handles spaced input", () => {
    const parsed = FilenameFromStringSchema.parse("  report .PNG ");
    // @ts-expect-error
    expect(parsed.basename).toBe("report");
    // @ts-expect-error
    expect(parsed.extension).toBe("png");
  });

  test("rejects strings without a proper dot-separated extension", () => {
    expect(() => FilenameFromStringSchema.parse("avatar")).toThrow(ZodError);
    try {
      // @ts-expect-error – we want the exact message
      FilenameFromStringSchema.parse("avatar");
    } catch (e) {
      const err = e as ZodError;
      expect(err.issues[0]?.message).toBe("filename_invalid");
    }
  });
});
