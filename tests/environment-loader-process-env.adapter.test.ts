import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentLoaderProcessEnvAdapter } from "../src/environment-loader-process-env.adapter";
import { NodeEnvironmentEnum, NodeEnvironmentError } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderProcessEnv", () => {
  test("happy path", async () => {
    const result = await new EnvironmentLoaderProcessEnvAdapter(
      { type: "local", schema: Schema },
      { ...process.env, APP_NAME: "MyApp" },
    ).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      () => new EnvironmentLoaderProcessEnvAdapter({ type: "invalid", schema: Schema }, process.env),
    ).toThrow(NodeEnvironmentError.Invalid);
  });
});
