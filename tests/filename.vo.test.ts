import { describe, expect, test } from "bun:test";
import { ZodError } from "zod/v4";
import { BasenameSchema } from "../src/basename.vo";
import { ExtensionSchema } from "../src/extension.vo";
import { Filename } from "../src/filename.vo";
import { FilenameSuffixSchema } from "../src/filename-suffix.vo";

describe("Filename", () => {
  test("fromParts returns 'name.ext' and normalizes the extension", () => {
    const filename = Filename.fromParts("report", " .PNG ").get();
    expect(filename).toBe("report.png");
  });

  test("fromPartsSafe accepts branded values and returns 'name.ext'", () => {
    const basename = BasenameSchema.parse("avatar");
    const extension = ExtensionSchema.parse("webp");
    const filename = Filename.fromPartsSafe(basename, extension).get();
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

  test("withExtension replaces only the extension", () => {
    const filename = Filename.fromString("avatar.webp");
    const extension = ExtensionSchema.parse("png");
    const updated = filename.withExtension(extension);

    expect(filename.get()).toBe("avatar.webp");
    expect(updated.get()).toBe("avatar.png");
  });

  test("withBasename replaces only the basename", () => {
    const filename = Filename.fromString("avatar.webp");
    const basename = BasenameSchema.parse("profile_v2");
    const updated = filename.withBasename(basename);

    expect(filename.get()).toBe("avatar.webp");
    expect(updated.get()).toBe("profile_v2.webp");
  });

  test("withSuffix appends a sanitized suffix before the extension", () => {
    const filename = Filename.fromString("avatar.webp");
    const updated = filename.withSuffix("-sm");
    expect(updated.get()).toBe("avatar-sm.webp");

    // disallowed characters are stripped → no change
    const unchanged = filename.withSuffix(" /@!🙂 ");
    expect(unchanged.get()).toBe("avatar.webp");
  });

  test("withSuffixSafe appends a suffix before the extension", () => {
    const filename = Filename.fromString("avatar.webp");
    const suffix = FilenameSuffixSchema.parse("-sm");
    const updated = filename.withSuffixSafe(suffix);
    expect(updated.get()).toBe("avatar-sm.webp");
  });
});
