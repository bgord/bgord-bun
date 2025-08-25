import { describe, expect, test } from "bun:test";
import { DirectoryPathAbsoluteSchema } from "../src/directory-path-absolute.vo";
import { DirectoryPathRelativeSchema } from "../src/directory-path-relative.vo";
import { AbsoluteFilePath, RelativeFilePath } from "../src/file-path.vo";
import { Filename } from "../src/filename.vo";

describe("RelativeFilePath", () => {
  test("builds and returns a relative file path", () => {
    const filename = Filename.fromString("avatar.webp");
    const relativePath = RelativeFilePath.fromParts("users/avatars", filename);
    expect(relativePath.get()).toBe("users/avatars/avatar.webp");
  });

  test("rebases to a new relative directory", () => {
    const filename = Filename.fromString("avatar.webp");
    const original = RelativeFilePath.fromParts("users/avatars", filename);
    const nextDirectory = DirectoryPathRelativeSchema.parse("users/pictures");
    const rebased = original.withDirectoryRelative(nextDirectory);
    expect(rebased.get()).toBe("users/pictures/avatar.webp");
  });

  test("converts to an absolute file path", () => {
    const filename = Filename.fromString("avatar.webp");
    const relativePath = RelativeFilePath.fromParts("users/avatars", filename);
    const absoluteDir = DirectoryPathAbsoluteSchema.parse("/tmp/app");
    const absolutePath = relativePath.toAbsolute(absoluteDir);
    expect(absolutePath.get()).toBe("/tmp/app/avatar.webp");
  });
});

describe("AbsoluteFilePath", () => {
  test("builds and returns an absolute file path", () => {
    const filename = Filename.fromString("avatar.webp");
    const absolutePath = AbsoluteFilePath.fromParts("/tmp/app/users", filename);
    expect(absolutePath.get()).toBe("/tmp/app/users/avatar.webp");
  });

  test("rebases to a new absolute directory", () => {
    const filename = Filename.fromString("avatar.webp");
    const original = AbsoluteFilePath.fromParts("/tmp/app/users", filename);
    const nextDirectory = DirectoryPathAbsoluteSchema.parse("/var/lib/app/users");
    const rebased = original.withDirectoryAbsolute(nextDirectory);
    expect(rebased.get()).toBe("/var/lib/app/users/avatar.webp");
  });

  test("converts to a relative file path", () => {
    const filename = Filename.fromString("avatar.webp");
    const absolutePath = AbsoluteFilePath.fromParts("/tmp/app/users", filename);
    const relativeDir = DirectoryPathRelativeSchema.parse("users/avatars");
    const relativePath = absolutePath.toRelative(relativeDir);
    expect(relativePath.get()).toBe("users/avatars/avatar.webp");
  });
});
