import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { EnvironmentLoaderNoopAdapter } from "../src/environment-loader-noop.adapter";

const Schema = z.object({ APP_NAME: z.string() });

describe("EnvironmentLoaderNoopAdapter", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderNoopAdapter({ type: "local", Schema }, { APP_NAME: "MyApp" });

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual("local");

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual("local");
  });

  test("failure", async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(
      { type: "local", Schema },
      // @ts-expect-error
      { APP_NAME: 123 },
    );

    expect(async () => adapter.load()).toThrow();
  });
});
