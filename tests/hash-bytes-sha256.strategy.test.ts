import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashBytesSha256Strategy } from "../src/hash-bytes-sha256.strategy";

describe("HashBytesSha256Strategy", () => {
  test("happy path", async () => {
    const hash = Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");

    const result = await new HashBytesSha256Strategy().hash(new TextEncoder().encode("hello"));

    expect(result.matches(hash)).toEqual(true);
  });

  test("distinct bytes - distinct hashes", async () => {
    const strategy = new HashBytesSha256Strategy();

    const first = await strategy.hash(new Uint8Array([0xff, 0x41]));
    const second = await strategy.hash(new Uint8Array([0xfe, 0x41]));

    expect(first.matches(second)).toEqual(false);
  });
});
