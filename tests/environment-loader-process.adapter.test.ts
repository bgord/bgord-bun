import { describe, expect, test } from "bun:test";
import * as z from "zod/v4";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import type { EnvironmentSchemaPort } from "../src/environment-schema.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Env = z.object({ APP_NAME: z.string("app.name.invalid") });
type EnvType = z.infer<typeof Env>;

const EnvironmentSchema: EnvironmentSchemaPort<EnvType> = { parse: (data: unknown) => Env.parse(data) };

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
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
          { type: NodeEnvironmentEnum.local, EnvironmentSchema },
          // @ts-expect-error Changed schema assertion
          { ...process.env, APP_NAME: 123 },
        ).load(),
    ).toThrow("app.name.invalid");
  });
});
