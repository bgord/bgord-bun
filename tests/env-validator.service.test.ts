import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentValidator, EnvironmentValidatorError } from "../src/env-validator.service";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvValidator service", () => {
  test("success", () => {
    process.env.APP_NAME = "MyApp";

    const result = new EnvironmentValidator<z.infer<typeof Schema>>({ type: "local", schema: Schema }).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(() => new EnvironmentValidator({ type: "invalid", schema: Schema })).toThrow(
      EnvironmentValidatorError.Invalid,
    );
  });
});
