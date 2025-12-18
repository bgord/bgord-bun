import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";

describe("HashContentSha256BunAdapter", () => {
  test("happy path", async () => {
    const hash = Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");

    const result = await new HashContentSha256BunAdapter().hash("hello");

    expect(result.matches(hash)).toEqual(true);
  });
});
