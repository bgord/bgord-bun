import { describe, expect, test } from "bun:test";
import { ZodError } from "zod/v4";
import { BasenameSchema } from "../src/basename.vo";
import { ExtensionSchema } from "../src/extension.vo";
import { Filename } from "../src/filename.vo";

describe("Filename (minimal)", () => {
  test("fromParts returns 'name.ext' and normalizes the extension", () => {
    const filenameValue = Filename.fromParts("report", " .PNG ").get();
    expect(filenameValue).toBe("report.png");
  });

  test("fromPartsSafe accepts branded values and returns 'name.ext'", () => {
    const basenameBranded = BasenameSchema.parse("avatar");
    const extensionBranded = ExtensionSchema.parse("webp");
    const filenameValue = Filename.fromPartsSafe(basenameBranded, extensionBranded).get();
    expect(filenameValue).toBe("avatar.webp");
  });

  test("fromString parses 'name.ext' and normalizes the extension", () => {
    const filenameValue = Filename.fromString("  image .WEBP ").get();
    expect(filenameValue).toBe("image.webp");
  });

  test("fromString rejects input without a proper dot-separated extension", () => {
    expect(() => Filename.fromString("avatar")).toThrow(ZodError);
    expect(() => Filename.fromString(".env")).toThrow(ZodError);
    expect(() => Filename.fromString("name.")).toThrow(ZodError);
  });

  test("get returns the internal string value", () => {
    const filenameObject = Filename.fromParts("user-photo", "jpg");
    expect(filenameObject.get()).toBe("user-photo.jpg");
  });
});
