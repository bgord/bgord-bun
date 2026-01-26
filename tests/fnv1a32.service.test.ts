import { describe, expect, test } from "bun:test";
import { fnv1a32 } from "../src/fnv1a32.service";

describe("fnv1a32", () => {
  test("deterministic", () => {
    const input = "550e8400-e29b-41d4-a716-446655440000";

    expect(fnv1a32(input)).toEqual(fnv1a32(input));
    expect(fnv1a32(input)).toEqual(fnv1a32(input));
  });

  test("different inputs produce different hashes", () => {
    const first = "550e8400-e29b-41d4-a716-446655440000";
    const second = "550e8400-e29b-41d4-a716-446655440001";

    expect(fnv1a32(first)).not.toEqual(fnv1a32(second));
  });

  test("stable known value", () => {
    expect(fnv1a32("")).toEqual(2166136261);
    expect(fnv1a32("")).toEqual(2166136261);
    expect(fnv1a32("a")).toEqual(3826002220);
    expect(fnv1a32("a")).toEqual(3826002220);
    expect(fnv1a32("hello")).toEqual(1335831723);
    expect(fnv1a32("hello")).toEqual(1335831723);
  });

  test("returns unsigned 32-bit integer", () => {
    const hash = fnv1a32("550e8400-e29b-41d4-a716-446655440000");

    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xffffffff);
  });

  test("modulo sampling", () => {
    const input = "550e8400-e29b-41d4-a716-446655440000";
    const everyNth = 10;

    const bucket = fnv1a32(input) % everyNth;

    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(everyNth);
  });
});
