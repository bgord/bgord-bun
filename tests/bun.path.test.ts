import { expect, test } from "bun:test";
import { Path, PathType } from "../src/path";

test("Path accepts a valid string", () => {
  const validPath = "/valid/path" as PathType;
  const result = Path.parse(validPath);

  expect(result).toBe(validPath);
});

test("Path rejects an empty string", () => {
  expect(() => Path.parse("")).toThrow();
});

test("Path has brand type", () => {
  const validPath = "/valid/path";
  const result = Path.parse(validPath);

  // Runtime check: should just be a string
  expect(typeof result).toBe("string");
});
