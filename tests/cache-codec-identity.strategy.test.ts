import { describe, expect, test } from "bun:test";
import { CacheCodecIdentityStrategy } from "../src/cache-codec-identity.strategy";

describe("CacheCodecIdentityStrategy", () => {
  test("encode", () => {
    expect(new CacheCodecIdentityStrategy<string>().encode("value")).toEqual("value");
  });

  test("decode", () => {
    expect(new CacheCodecIdentityStrategy<string>().decode("value")).toEqual("value");
  });

  test("JSON round trip", () => {
    const codec = new CacheCodecIdentityStrategy<{ nested: { count: number } }>();
    const value = { nested: { count: 1 } };

    expect(codec.decode(JSON.parse(JSON.stringify(codec.encode(value))))).toEqual(value);
  });
});
