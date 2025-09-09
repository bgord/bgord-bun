import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentValidator } from "../src/env-validator.service";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const DummySchema = z.object({ APP_NAME: z.string() });

describe("Env validator", () => {
  test("EnvironmentValidator constructs and parses successfully", () => {
    process.env.APP_NAME = "MyApp";

    const validator = new EnvironmentValidator<z.infer<typeof DummySchema>>({
      type: "local",
      schema: DummySchema,
    });
    const result = validator.load();

    expect(result.APP_NAME).toBe("MyApp");
    expect(result.type).toBe(NodeEnvironmentEnum.local);
  });

  test("exits if NodeEnvironment is invalid", () => {
    expect(() => new EnvironmentValidator({ type: "invalid-env", schema: DummySchema })).toThrow(
      /Invalid node environment/,
    );
  });
});
