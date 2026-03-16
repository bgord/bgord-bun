import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import * as mocks from "./mocks";

const EnvironmentSchema = v.object({ APP_NAME: v.string("app.name.invalid") });

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
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
          { ...process.env, APP_NAME: 123 },
          { type: NodeEnvironmentEnum.local, EnvironmentSchema },
        ).load(),
    ).toThrow("app.name.invalid");
  });

  test("failure - async schema", async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, EnvironmentSchema: mocks.asyncSchema },
    );

    expect(async () => adapter.load()).toThrow("environment.loader.no.async.schema");
  });
});
