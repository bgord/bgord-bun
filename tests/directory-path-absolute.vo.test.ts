import { describe, test, expect } from "bun:test";
import { ZodError } from "zod/v4";
import { DirectoryPathAbsoluteSchema } from "../src/directory-path-absolute.vo";

function expectZodIssue(inputString: string, expectedMessage: string) {
  try {
    // @ts-ignore we intentionally expect a throw
    DirectoryPathAbsoluteSchema.parse(inputString);
    throw new Error("Expected DirectoryPathAbsoluteSchema to fail, but it passed");
  } catch (error) {
    expect(error instanceof ZodError).toBe(true);
    const firstIssue = (error as ZodError).issues[0];
    expect(firstIssue?.message).toBe(expectedMessage);
  }
}

describe("DirectoryPathAbsoluteSchema", () => {
  test("accepts absolute directory paths and normalizes slashes", () => {
    // @ts-expect-error
    expect(DirectoryPathAbsoluteSchema.parse("/tmp/app/users")).toBe("/tmp/app/users");
    // collapses multiple slashes and strips trailing slash
    // @ts-expect-error
    expect(DirectoryPathAbsoluteSchema.parse("/tmp//app///users/")).toBe("/tmp/app/users");
  });

  test("accepts root directory as-is", () => {
    // @ts-expect-error
    expect(DirectoryPathAbsoluteSchema.parse("/")).toBe("/");
  });

  test("rejects relative paths, backslashes, and control characters", () => {
    expectZodIssue("tmp/app", "abs_dir_must_start_with_slash");
    expectZodIssue("/tmp\\app", "abs_dir_backslash_forbidden");
    expectZodIssue("/tmp\napp", "abs_dir_control_chars_forbidden");
  });

  test("rejects dot segments and invalid segments", () => {
    expectZodIssue("/tmp/../etc", "abs_dir_bad_segments");
    expectZodIssue("/tmp/./users", "abs_dir_bad_segments");
    expectZodIssue("/tmp/app/invalid segment", "abs_dir_bad_segments");
  });
});
