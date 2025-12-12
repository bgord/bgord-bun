import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentValidator } from "../src/environment-validator.service";
import { NodeEnvironmentEnum, NodeEnvironmentError } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentValidator service", () => {
  test("happy path", () => {
    process.env.APP_NAME = "MyApp";

    const result = new EnvironmentValidator({ type: "local", schema: Schema }).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(() => new EnvironmentValidator({ type: "invalid", schema: Schema })).toThrow(
      NodeEnvironmentError.Invalid,
    );
  });
});
