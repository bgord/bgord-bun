import { describe, expect, test } from "bun:test";
import { ContentHashSha256BunAdapter } from "../src/content-hash-sha256-bun.adapter";

describe("ContentHashSha256BunAdapter", () => {
  test("happy path", async () => {
    const result = await new ContentHashSha256BunAdapter().hash("hello");

    expect(result.etag).toEqual("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
