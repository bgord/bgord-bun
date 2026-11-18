import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { CommitShaValue } from "../src/commit-sha-value.vo";

describe("CommitShaValue", () => {
  test("happy path", () => {
    expect(v.safeParse(CommitShaValue, "f".repeat(40)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(CommitShaValue, null)).toThrow("commit.sha.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(CommitShaValue, 2024)).toThrow("commit.sha.value.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(CommitShaValue, "")).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects uppercased", () => {
    expect(() => v.parse(CommitShaValue, "F".repeat(40))).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => v.parse(CommitShaValue, `${"f".repeat(39)}x`)).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => v.parse(CommitShaValue, "f".repeat(41))).toThrow("commit.sha.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => v.parse(CommitShaValue, "f".repeat(39))).toThrow("commit.sha.value.invalid.hex");
  });
});
