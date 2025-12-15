import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const result = await new EnvironmentLoaderProcessAdapter(
      { type: NodeEnvironmentEnum.local, schema: Schema },
      { ...process.env, APP_NAME: "MyApp" },
    ).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      async () =>
        await new EnvironmentLoaderProcessAdapter(
          // @ts-expect-error
          { type: "invalid", schema: Schema },
          { ...process.env, APP_NAME: 123 },
        ).load(),
    ).toThrow();
  });
});
