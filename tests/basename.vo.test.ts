import { describe, expect, it } from "bun:test";
import { ZodError } from "zod/v4";
import { BasenameSchema } from "../src/basename.vo";

function expectZodIssue(input: string, expectedMsg: string) {
  try {
    BasenameSchema.parse(input);
    throw new Error("Expected BasenameSchema to fail, but it passed");
  } catch (err) {
    expect(err instanceof ZodError).toBe(true);
    const issue = (err as ZodError).issues[0];
    expect(issue?.message).toBe(expectedMsg);
  }
}

describe("BasenameSchema", () => {
  it("accepts typical safe names", () => {
    // @ts-expect-error
    expect(BasenameSchema.parse("avatar")).toBe("avatar");
    // @ts-expect-error
    expect(BasenameSchema.parse("Report_v1.2-rc")).toBe("Report_v1.2-rc");
    // @ts-expect-error
    expect(BasenameSchema.parse(" a.b_c-d ")).toBe("a.b_c-d"); // trims
  });

  it("accepts max length 128 and rejects 129", () => {
    const ok = "a".repeat(128);
    // @ts-expect-error
    expect(BasenameSchema.parse(ok)).toBe(ok);

    const tooLong = "a".repeat(129);
    expectZodIssue(tooLong, "basename_too_long");
  });

  it("rejects empty/whitespace", () => {
    expectZodIssue("", "basename_empty");
    expectZodIssue("   ", "basename_empty");
  });

  it("rejects slashes and backslashes", () => {
    expectZodIssue("a/b", "basename_slashes_forbidden");
    expectZodIssue("a\\b", "basename_slashes_forbidden");
  });

  it("rejects control characters", () => {
    expectZodIssue("line\nbreak", "basename_control_chars_forbidden");
    expectZodIssue("nul\u0000byte", "basename_control_chars_forbidden");
  });

  it("rejects dotfiles and dot segments", () => {
    expectZodIssue(".", "basename_dot_segments_forbidden");
    expectZodIssue("..", "basename_dot_segments_forbidden");
    expectZodIssue(".env", "basename_dotfiles_forbidden");
  });

  it("rejects trailing dot", () => {
    expectZodIssue("name.", "basename_trailing_dot_forbidden");
  });

  it("rejects disallowed characters (spaces, emoji, symbols)", () => {
    expectZodIssue("name name", "basename_bad_chars");
    expectZodIssue("name🙂", "basename_bad_chars");
    expectZodIssue("name@", "basename_bad_chars");
  });
});
