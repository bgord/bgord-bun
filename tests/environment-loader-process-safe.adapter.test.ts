import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderProcessSafe", () => {
  test("happy path", async () => {
    process.env.APP_NAME = "MyApp";
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { type: NodeEnvironmentEnum.local, Schema },
      { ...process.env, APP_NAME: "MyApp" },
    );

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
    // @ts-expect-error
    expect(process.env.APP_NAME).toEqual(undefined);

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      async () =>
        await new EnvironmentLoaderProcessSafeAdapter(
          // @ts-expect-error
          { type: "invalid", Schema },
          { ...process.env, APP_NAME: 123 },
        ).load(),
    ).toThrow();
  });
});
