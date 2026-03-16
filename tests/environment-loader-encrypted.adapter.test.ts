import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EncryptionNoopAdapter } from "../src/encryption-noop.adapter";
import { EnvironmentLoaderEncryptedAdapter } from "../src/environment-loader-encrypted.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import * as mocks from "./mocks";

const EnvironmentSchema = v.object({ APP_NAME: v.string("app.name.invalid") }, "env.empty");

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

  test("failure - async schema", async () => {
    const adapter = new EnvironmentLoaderEncryptedAdapter(
      path,
      { type: NodeEnvironmentEnum.local, EnvironmentSchema: mocks.asyncSchema },
      { Encryption: new EncryptionNoopAdapter(env) },
    );

    expect(async () => adapter.load()).toThrow("environment.loader.no.async.schema");
  });
});
