import { describe, expect, test } from "bun:test";
import path from "node:path";
import { Filename } from "../src/filename.vo";

describe("Filename", () => {
  test("returns an absolute path composed via path.resolve(base, ext)", () => {
    const full = Filename.fromParts("avatar", "webp").get();

    expect(path.isAbsolute(full)).toBe(true);
    expect(full.endsWith(path.join("avatar", "webp"))).toBe(true);
  });

  test("uses the normalized extension (leading dot stripped, lowercased)", () => {
    const full = Filename.fromParts("report", " .PNG ").get();

    expect(full.endsWith(path.join("report", "png"))).toBe(true);
  });

  test("get() returns the internal string value", () => {
    const created = Filename.fromParts("user-photo", "jpg");
    expect(typeof created.get()).toBe("string");
    expect(created.get().endsWith(path.join("user-photo", "jpg"))).toBe(true);
  });
});
