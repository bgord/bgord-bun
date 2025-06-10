import { describe, expect, test } from "bun:test";

import { HashedPassword, Password } from "../src/passwords.vo";

describe("Passwords", () => {
  test("Password stores and returns a valid password", () => {
    const password = new Password("supersecret123");
    expect(password.read()).toBe("supersecret123");
  });

  test("Password throws if invalid (empty)", () => {
    expect(() => new Password("")).toThrow();
  });

  test("Password throws if longer than 256 chars", () => {
    const longPassword = "x".repeat(257);
    expect(() => new Password(longPassword)).toThrow();
  });

  test("Password hashes to HashedPassword", async () => {
    const password = new Password("supersecret123");
    const hashed = await password.hash();

    expect(hashed).toBeInstanceOf(HashedPassword);
    expect(typeof hashed.read()).toBe("string");
  });

  test("HashedPassword.matches returns true for correct password", async () => {
    const password = new Password("correct-password");
    const hashed = await password.hash();

    const result = await hashed.matches(password);
    expect(result).toBe(true);
  });

  test("HashedPassword.matches returns false for incorrect password", async () => {
    const password = new Password("original-password");
    const hashed = await password.hash();

    const wrongPassword = new Password("wrong-password");
    const result = await hashed.matches(wrongPassword);

    expect(result).toBe(false);
  });

  test("HashedPassword.matchesOrThrow throws for incorrect password", async () => {
    const password = new Password("original-password");
    const hashed = await password.hash();

    const wrongPassword = new Password("wrong-password");

    expect(async () => await hashed.matchesOrThrow(wrongPassword)).toThrow(
      "HashedPassword does not match the provided password",
    );
  });

  test("HashedPassword.matchesOrThrow returns true for correct password", async () => {
    const password = new Password("original-password");
    const hashed = await password.hash();

    const result = await hashed.matchesOrThrow(password);
    expect(result).toBe(true);
  });
});
