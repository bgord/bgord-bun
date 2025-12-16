import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { EncryptionNoopAdapter } from "../src/encryption-noop.adapter";
import { EnvironmentLoaderEncryptedAdapter } from "../src/environment-loader-encrypted.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const path = tools.FilePathRelative.fromString("config/secrets.txt");
const env = new TextEncoder().encode("APP_NAME=MyApp").buffer;
const SchemaError = { InvalidAppName: "schema.app.name.invalid" };
const config = {
  type: NodeEnvironmentEnum.local,
  Schema: z.object({ APP_NAME: z.string({ error: SchemaError.InvalidAppName }) }),
};

describe("EnvironmentLoaderProcess", () => {
  test("happy path", async () => {
    const result = await new EnvironmentLoaderEncryptedAdapter(config, path, {
      Encryption: new EncryptionNoopAdapter(env),
    }).load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
  });

  test("failure", () => {
    expect(
      async () =>
        await new EnvironmentLoaderEncryptedAdapter(config, path, {
          Encryption: new EncryptionNoopAdapter(),
        }).load(),
    ).toThrow(SchemaError.InvalidAppName);
  });
});
