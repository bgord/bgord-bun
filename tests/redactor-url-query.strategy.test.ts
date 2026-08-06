import { describe, expect, test } from "bun:test";
import { RedactorUrlQuery } from "../src/redactor-url-query.strategy";

const redactor = new RedactorUrlQuery(["code", "token"]);

describe("RedactorUrlQuery", () => {
  test("redact", () => {
    const input = { url: "https://example.com/callback?code=oauth-code&token=secret&page=2" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback?code=***&token=***&page=2" });
  });

  test("redact - case insensitive key", () => {
    const input = { url: "https://example.com/callback?Code=oauth-code" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback?Code=***" });
  });

  test("redact - repeated key", () => {
    const input = { url: "https://example.com/callback?code=first&code=second" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback?code=***&code=***" });
  });

  test("redact - no query", () => {
    const input = { url: "https://example.com/callback" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback" });
  });

  test("redact - empty query", () => {
    const input = { url: "https://example.com/callback?" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback?" });
  });

  test("redact - relative url", () => {
    const input = { url: "/callback?code=oauth-code" };

    expect(redactor.redact(input)).toEqual({ url: "/callback?code=***" });
  });

  test("redact - other fields untouched", () => {
    const input = { url: "https://example.com/callback?code=oauth-code", method: "GET", status: 200 };

    expect(redactor.redact(input)).toEqual({
      url: "https://example.com/callback?code=***",
      method: "GET",
      status: 200,
    });
  });

  test("redact - no url", () => {
    const input = { method: "GET" };

    expect(redactor.redact(input)).toEqual({ method: "GET" });
  });

  test("redact - url not a string", () => {
    const input = { url: 123 };

    expect(redactor.redact(input)).toEqual({ url: 123 });
  });

  test("redact - not a plain object", () => {
    expect(redactor.redact("https://example.com/callback?code=oauth-code")).toEqual(
      "https://example.com/callback?code=oauth-code",
    );
    expect(redactor.redact(null)).toEqual(null);
  });

  test("default keys", () => {
    const redactor = new RedactorUrlQuery();
    const input = { url: "https://example.com/callback?secret=a&otp=b&password=c&page=2" };

    expect(redactor.redact(input)).toEqual({
      url: "https://example.com/callback?secret=***&otp=***&password=***&page=2",
    });
  });

  test("default keys - empty override", () => {
    const redactor = new RedactorUrlQuery([]);
    const input = { url: "https://example.com/callback?code=oauth-code" };

    expect(redactor.redact(input)).toEqual({ url: "https://example.com/callback?code=***" });
  });
});
