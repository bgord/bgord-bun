import { describe, expect, test } from "bun:test";

import { BasicAuthPassword, BasicAuthUsername } from "../src/basic-auth";

describe("Basic auth validators", () => {
  test("BasicAuthUsername - valid", () => {
    expect(() => BasicAuthUsername.parse("admin")).not.toThrow();
  });

  test("BasicAuthUsername - empty", () => {
    expect(() => BasicAuthUsername.parse("")).toThrow();
  });

  test("BasicAuthUsername - too long", () => {
    const longUsername = "u".repeat(129);
    expect(() => BasicAuthUsername.parse(longUsername)).toThrow();
  });

  test("BasicAuthPassword - valid", () => {
    expect(() => BasicAuthPassword.parse("secure-password123")).not.toThrow();
  });

  test("BasicAuthPassword - empty", () => {
    expect(() => BasicAuthPassword.parse("")).toThrow();
  });

  test("BasicAuthPassword - too long", () => {
    const longPassword = "p".repeat(129);
    expect(() => BasicAuthPassword.parse(longPassword)).toThrow();
  });
});
