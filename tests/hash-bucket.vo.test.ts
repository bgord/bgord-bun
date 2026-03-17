import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hash } from "../src/hash.vo";
import { HashBucket } from "../src/hash-bucket.vo";

const a = Hash.fromString("a".repeat(64));
const f = Hash.fromString("f".repeat(64));
const zeros = Hash.fromString("0".repeat(64));

describe("HashBucket", () => {
  test("happy path", () => {
    const bucket = HashBucket.fromHash(a);

    expect(bucket.value).toBeGreaterThanOrEqual(0);
    expect(bucket.value).toBeLessThanOrEqual(99);
  });

  test("idempotence", () => {
    expect(HashBucket.fromHash(a).value).toEqual(HashBucket.fromHash(a).value);
  });

  test("different hashes produce different buckets", () => {
    expect(HashBucket.fromHash(a).value).not.toEqual(HashBucket.fromHash(f).value);
  });

  test("isLessThan - true", () => {
    expect(HashBucket.fromHash(a).isLessThan(tools.Int.nonNegative(50))).toEqual(true);
  });

  test("isLessThan - false", () => {
    expect(HashBucket.fromHash(f).isLessThan(tools.Int.nonNegative(10))).toBe(false);
  });

  test("all zeros", () => {
    expect(HashBucket.fromHash(zeros).value).toEqual(tools.Int.nonNegative(0));
  });
});
