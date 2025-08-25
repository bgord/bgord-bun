import { describe, expect, test } from "bun:test";
import path from "node:path";
import { BasenameSchema } from "../src/basename.vo";
import { ExtensionSchema } from "../src/extension.vo";
import { Filename } from "../src/filename.vo";

describe("Filename", () => {
  describe("fromParts", () => {
    test("returns an absolute path composed via path.resolve(base, ext)", () => {
      const full = Filename.fromParts("avatar", "webp").get();

      expect(path.isAbsolute(full)).toBe(true);
      expect(full.endsWith(path.join("avatar", "webp"))).toBe(true);
    });

    test("uses the normalized extension (leading dot stripped, lowercased)", () => {
      const full = Filename.fromParts("report", " .PNG ").get();

      expect(full.endsWith(path.join("report", "png"))).toBe(true);
    });
  });

  describe("fromPartsSafe", () => {
    test("returns an absolute path composed via path.resolve(base, ext)", () => {
      const basename = BasenameSchema.parse("avatar");
      const extension = ExtensionSchema.parse("webp");
      const full = Filename.fromPartsSafe(basename, extension).get();

      expect(path.isAbsolute(full)).toBe(true);
      expect(full.endsWith(path.join("avatar", "webp"))).toBe(true);
    });

    test("uses the normalized extension (leading dot stripped, lowercased)", () => {
      const basename = BasenameSchema.parse("report");
      const extension = ExtensionSchema.parse(" .PNG ");
      const full = Filename.fromPartsSafe(basename, extension).get();

      expect(full.endsWith(path.join("report", "png"))).toBe(true);
    });
  });

  test("get() returns the internal string value", () => {
    const created = Filename.fromParts("user-photo", "jpg");
    expect(typeof created.get()).toBe("string");
    expect(created.get().endsWith(path.join("user-photo", "jpg"))).toBe(true);
  });
});
