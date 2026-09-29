/* cSpell:disable */
import { describe, expect, test } from "bun:test";
import { RedactorKey } from "../src/redactor-key.vo";

describe("RedactorKey", () => {
  test("fromString", () => {
    expect(RedactorKey.fromString("token").get()).toEqual("token");
  });

  test("fromString - lowercase", () => {
    expect(RedactorKey.fromString("accessToken").get()).toEqual("accesstoken");
  });

  test("fromString - snake_case", () => {
    expect(RedactorKey.fromString("access_token").get()).toEqual("accesstoken");
  });

  test("fromString - kebab-case", () => {
    expect(RedactorKey.fromString("access-token").get()).toEqual("accesstoken");
  });

  test("matches - true", () => {
    expect(RedactorKey.fromString("access_token").matches(RedactorKey.fromString("AccessToken"))).toEqual(
      true,
    );
  });

  test("matches - false", () => {
    expect(RedactorKey.fromString("access_token").matches(RedactorKey.fromString("refresh_token"))).toEqual(
      false,
    );
  });
});
