import { describe, expect, test } from "bun:test";
import { CommitSha } from "../src/commit-sha.vo";
import { CommitShaValue } from "../src/commit-sha-value.vo";

const value = "a".repeat(40);
const sha = CommitSha.fromString(value);

const another = "b".repeat(40);

describe("CommitSha", () => {
  test("fromString", () => {
    expect(sha.toJSON()).toEqual(CommitShaValue.parse(value));
  });

  test("fromStringSafe", () => {
    expect(CommitSha.fromStringSafe(CommitShaValue.parse(value)).toJSON()).toEqual(value);
  });

  test("equals - true", () => {
    expect(sha.equals(sha)).toEqual(true);
  });

  test("equals - false", () => {
    expect(sha.equals(CommitSha.fromString(another))).toEqual(false);
  });

  test("toString", () => {
    expect(sha.toString()).toEqual(CommitShaValue.parse(value));
  });

  test("toShortString", () => {
    expect(sha.toShortString()).toEqual(value.slice(0, 7));
  });

  test("toJSON", () => {
    expect(sha.toJSON()).toEqual(value);
  });
});
