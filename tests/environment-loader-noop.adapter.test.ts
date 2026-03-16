import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { EnvironmentLoaderNoopAdapter } from "../src/environment-loader-noop.adapter";
import type { EnvironmentSchemaPort } from "../src/environment-schema.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Env = v.object({ APP_NAME: v.string() });
type EnvType = v.InferOutput<typeof Env>;

const EnvironmentSchema: EnvironmentSchemaPort<EnvType> = { parse: (data: unknown) => v.parse(Env, data) };

describe("EnvironmentLoaderNoopAdapter", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
      { APP_NAME: "MyApp" },
    );

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
      // @ts-expect-error Changed schema assertion
      { APP_NAME: 123 },
    );

    expect(async () => adapter.load()).toThrow();
  });
});
