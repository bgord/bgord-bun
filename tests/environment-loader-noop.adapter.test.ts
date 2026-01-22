import { describe, expect, test } from "bun:test";
import * as z from "zod/v4";
import { EnvironmentLoaderNoopAdapter } from "../src/environment-loader-noop.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderNoopAdapter", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(
      { type: NodeEnvironmentEnum.local, Schema },
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
      { type: NodeEnvironmentEnum.local, Schema },
      // @ts-expect-error Changed schema assertion
      { APP_NAME: 123 },
    );

    expect(async () => adapter.load()).toThrow();
  });
});
