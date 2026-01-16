import { describe, expect, test } from "bun:test";
import { NodeEnvironment } from "../src/node-env.vo";

describe("NodeEnvironment VO", () => {
  test("happy path", () => {
    expect(NodeEnvironment.safeParse("local").success).toEqual(true);
    expect(NodeEnvironment.safeParse("test").success).toEqual(true);
    expect(NodeEnvironment.safeParse("staging").success).toEqual(true);
    expect(NodeEnvironment.safeParse("production").success).toEqual(true);
  });

  test("rejects unknown", () => {
    expect(() => NodeEnvironment.parse("unknown")).toThrow("node.environment.invalid");
  });
});
