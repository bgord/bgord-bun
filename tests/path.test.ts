import { describe, expect, test } from "bun:test";

import { Path, PathType } from "../src/path.vo";

describe("Path", () => {
  test("Path accepts a valid string", () => {
    const validPath = "/valid/path" as PathType;
    const result = Path.parse(validPath);

    expect(result).toBe(validPath);
  });

  test("Path rejects an empty string", () => {
    expect(() => Path.parse("")).toThrow();
  });
});
