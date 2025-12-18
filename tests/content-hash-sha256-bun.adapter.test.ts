import { describe, expect, test } from "bun:test";
import { ContentHashSha256BunAdapter } from "../src/content-hash-sha256-bun.adapter";
import { Hash } from "../src/hash.vo";

describe("ContentHashSha256BunAdapter", () => {
  test("happy path", async () => {
    const hash = Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");

    const result = await new ContentHashSha256BunAdapter().hash("hello");

    expect(result.matches(hash)).toEqual(true);
  });
});
