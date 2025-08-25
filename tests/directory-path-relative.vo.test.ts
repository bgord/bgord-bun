import { describe, expect, test } from "bun:test";
import { ZodError } from "zod/v4";
import { DirectoryPathRelativeSchema } from "../src/directory-path-relative.vo";

function expectZodIssue(inputString: string, expectedMessage: string) {
  try {
    // @ts-expect-error we want this to throw
    DirectoryPathRelativeSchema.parse(inputString);
    throw new Error("Expected to fail, but it passed");
  } catch (error) {
    expect(error instanceof ZodError).toBe(true);
    const issue = (error as ZodError).issues[0];
    expect(issue?.message).toBe(expectedMessage);
  }
}

describe("DirectoryPathRelativeSchema", () => {
  test("accepts and returns a normalized relative directory", () => {
    // @ts-expect-error
    expect(DirectoryPathRelativeSchema.parse("users/avatars")).toBe("users/avatars");
    // collapses double slashes and strips trailing slashes
    // @ts-expect-error
    expect(DirectoryPathRelativeSchema.parse("users//avatars/")).toBe("users/avatars");
  });

  test("rejects leading slash, backslash, control chars", () => {
    expectZodIssue("/users/avatars", "rel_dir_must_not_start_with_slash");
    expectZodIssue("users\\avatars", "rel_dir_backslash_forbidden");
    expectZodIssue("users\navatars", "rel_dir_control_chars_forbidden");
  });

  test("rejects empty (after trim) and dot segments", () => {
    expectZodIssue("   ", "rel_dir_empty");
    expectZodIssue("users/./avatars", "rel_dir_bad_segments");
    expectZodIssue("users/../avatars", "rel_dir_bad_segments");
  });
});
