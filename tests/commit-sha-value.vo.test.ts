import { describe, expect, test } from "bun:test";
import { CommitShaValue } from "../src/commit-sha-value.vo";

describe("CommitShaValue VO", () => {
  test("happy path", () => {
    expect(CommitShaValue.safeParse("f".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => CommitShaValue.parse(null)).toThrow("commit.sha.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => CommitShaValue.parse(2024)).toThrow("commit.sha.value.type");
  });

  test("rejects empty", () => {
    expect(() => CommitShaValue.parse("")).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => CommitShaValue.parse(`${"f".repeat(39)}x`)).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => CommitShaValue.parse("f".repeat(41))).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => CommitShaValue.parse("f".repeat(39))).toThrow("commit.sha.value.invalid.hex");
  });
});
