import { describe, expect, test } from "bun:test";
import { NodeEnvironment, NodeEnvironmentEnum, NodeEnvironmentError } from "../src/node-env.vo";

describe("NodeEnvironment VO", () => {
  test("happy path", () => {
    expect(NodeEnvironment.safeParse(NodeEnvironmentEnum.local).success).toEqual(true);
    expect(NodeEnvironment.safeParse(NodeEnvironmentEnum.test).success).toEqual(true);
    expect(NodeEnvironment.safeParse(NodeEnvironmentEnum.staging).success).toEqual(true);
    expect(NodeEnvironment.safeParse(NodeEnvironmentEnum.production).success).toEqual(true);
  });

  test("rejects unknown", () => {
    expect(() => NodeEnvironment.parse("unknown")).toThrow(NodeEnvironmentError.Invalid);
  });
});
