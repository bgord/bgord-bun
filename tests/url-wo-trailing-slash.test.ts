import { describe, expect, test } from "bun:test";
import { UrlWithoutTrailingSlash } from "../src/url-wo-trailing-slash.vo";

describe("UrlWithoutTrailingSlash", () => {
  test("should pass with a valid URL without trailing slash", () => {
    const result = UrlWithoutTrailingSlash.safeParse("https://example.com");
    expect(result.success).toBe(true);
  });

  test("should work with trimmed URL that still ends with slash", () => {
    const result = UrlWithoutTrailingSlash.safeParse("  https://example.com/ ");
    expect(result.success).toBe(false);
  });

  test("should fail with a URL that ends with a trailing slash", () => {
    const result = UrlWithoutTrailingSlash.safeParse("https://example.com/");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("url_cannot_end_with_trailing_slash");
    }
  });

  test("should fail with an invalid URL", () => {
    const result = UrlWithoutTrailingSlash.safeParse("not-a-valid-url");
    expect(result.success).toBe(false);
  });

  test("should fail with an empty string", () => {
    const result = UrlWithoutTrailingSlash.safeParse("");
    expect(result.success).toBe(false);
  });

  test("should trim leading/trailing whitespace before validation", () => {
    const result = UrlWithoutTrailingSlash.safeParse("   https://example.com   ");
    expect(result.success).toBe(true);
  });
});
