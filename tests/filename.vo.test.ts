import { describe, expect, test } from "bun:test";
import { ZodError } from "zod/v4";
import { BasenameSchema } from "../src/basename.vo";
import { ExtensionSchema } from "../src/extension.vo";
import { Filename } from "../src/filename.vo";

describe("Filename (minimal)", () => {
  test("fromParts returns 'name.ext' and normalizes the extension", () => {
    const filename = Filename.fromParts("report", " .PNG ").get();
    expect(filename).toBe("report.png");
  });

  test("fromPartsSafe accepts branded values and returns 'name.ext'", () => {
    const basenameBranded = BasenameSchema.parse("avatar");
    const extensionBranded = ExtensionSchema.parse("webp");
    const filename = Filename.fromPartsSafe(basenameBranded, extensionBranded).get();
    expect(filename).toBe("avatar.webp");
  });

  test("fromString parses 'name.ext' and normalizes the extension", () => {
    const filename = Filename.fromString("  image .WEBP ").get();
    expect(filename).toBe("image.webp");
  });

  test("fromString rejects input without a proper dot-separated extension", () => {
    expect(() => Filename.fromString("avatar")).toThrow(ZodError);
    expect(() => Filename.fromString(".env")).toThrow(ZodError);
    expect(() => Filename.fromString("name.")).toThrow(ZodError);
  });

  test("get returns the internal string value", () => {
    const filename = Filename.fromParts("user-photo", "jpg");
    expect(filename.get()).toBe("user-photo.jpg");
  });

  test("get basename", () => {
    const filename = Filename.fromString("user-photo.jpg");
    // @ts-expect-error
    expect(filename.getBasename()).toBe("user-photo");
  });

  test("get extension", () => {
    const filename = Filename.fromString("user-photo.jpg");
    // @ts-expect-error
    expect(filename.getExtension()).toBe("jpg");
  });
});
