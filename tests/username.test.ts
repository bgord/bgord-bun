import { expect, test } from "bun:test";
import { z } from "zod/v4";
import { Username } from "../src/username";

test("Username accepts a valid username", () => {
  const username = new Username("alice");
  expect(username.read()).toBe("alice");
});

test("Username rejects a username longer than 256 characters", () => {
  const longUsername = "a".repeat(257);
  expect(() => new Username(longUsername)).toThrow();
});

test("Username allows custom schema", () => {
  const customSchema = z.string().startsWith("@");

  const username = new Username("@alice", customSchema);
  expect(username.read()).toBe("@alice");
});

test("Username with invalid custom schema throws", () => {
  const customSchema = z.string().refine((value) => value === "admin");

  expect(() => new Username("guest", customSchema)).toThrow();
});
