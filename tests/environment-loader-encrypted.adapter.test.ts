import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EncryptionNoopAdapter } from "../src/encryption-noop.adapter";
import { EnvironmentLoaderEncryptedAdapter } from "../src/environment-loader-encrypted.adapter";
import type { EnvironmentSchemaPort } from "../src/environment-schema.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Env = v.object({ APP_NAME: v.string("app.name.invalid") }, "env.empty");
type EnvType = v.InferOutput<typeof Env>;

const EnvironmentSchema: EnvironmentSchemaPort<EnvType> = { parse: (data: unknown) => v.parse(Env, data) };

const config = { type: NodeEnvironmentEnum.local, EnvironmentSchema };

const path = tools.FilePathAbsolute.fromString("/config/secrets.txt");
const env = new TextEncoder().encode("APP_NAME=MyApp").buffer;

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const result = await new EnvironmentLoaderEncryptedAdapter(path, config, {
      Encryption: new EncryptionNoopAdapter(env),
    }).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      async () =>
        await new EnvironmentLoaderEncryptedAdapter(path, config, {
          Encryption: new EncryptionNoopAdapter(),
        }).load(),
    ).toThrow("env.empty");
  });
});
