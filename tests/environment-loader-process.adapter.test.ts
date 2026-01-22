import { describe, expect, test } from "bun:test";
import * as z from "zod/v4";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { type: NodeEnvironmentEnum.local, Schema },
      { ...process.env, APP_NAME: "MyApp" },
    );

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      async () =>
        await new EnvironmentLoaderProcessAdapter(
          // @ts-expect-error Changed schema assertion
          { type: "invalid", Schema },
          { ...process.env, APP_NAME: 123 },
        ).load(),
    ).toThrow();
  });
});
