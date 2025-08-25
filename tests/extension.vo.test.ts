import { describe, expect, it } from "bun:test";
import { ZodError } from "zod/v4";
import { ExtensionSchema } from "../src/extension.vo";

function expectZodIssue(input: string, expectedMsg: string) {
  try {
    ExtensionSchema.parse(input);
    throw new Error("Expected ExtensionSchema to fail, but it passed");
  } catch (err) {
    expect(err instanceof ZodError).toBe(true);
    const issue = (err as ZodError).issues[0];
    expect(issue?.message).toBe(expectedMsg);
  }
}

describe("ExtensionSchema", () => {
  it("accepts simple lowercase extensions", () => {
    // @ts-expect-error
    expect(ExtensionSchema.parse("webp")).toBe("webp");
    // @ts-expect-error
    expect(ExtensionSchema.parse("jpg")).toBe("jpg");
    // @ts-expect-error
    expect(ExtensionSchema.parse("7z")).toBe("7z");
  });

  it("strips a leading dot and lowercases", () => {
    // @ts-expect-error
    expect(ExtensionSchema.parse(".PNG")).toBe("png");
    // @ts-expect-error
    expect(ExtensionSchema.parse("  JpEg  ")).toBe("jpeg");
  });

  it("rejects empty and single dot", () => {
    expectZodIssue("", "extension_empty");
    expectZodIssue(".", "extension_empty"); // '.' → '' after transform
  });

  it("enforces max length 16", () => {
    const ok = "a".repeat(16);
    // @ts-expect-error
    expect(ExtensionSchema.parse(ok)).toBe(ok);

    const tooLong = "a".repeat(17);
    expectZodIssue(tooLong, "extension_too_long");
  });

  it("rejects disallowed characters", () => {
    expectZodIssue("web-p", "extension_bad_chars"); // hyphen not allowed
    expectZodIssue("web p", "extension_bad_chars"); // space not allowed
    expectZodIssue("webp!", "extension_bad_chars"); // punctuation not allowed
    expectZodIssue("..png", "extension_bad_chars"); // after transform → ".png" (dot disallowed)
  });
});
