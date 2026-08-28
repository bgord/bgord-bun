import { describe, expect, test } from "bun:test";
import { EncryptionNoopAdapter } from "../src/encryption-noop.adapter";
import { EnvironmentLoaderEncryptedAdapter } from "../src/environment-loader-encrypted.adapter";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

describe("EnvironmentLoaderEncryptedAdapter", () => {
  test(cases.happyPath.name, async () => {
    const adapter = new EnvironmentLoaderEncryptedAdapter(cases.subjects.path, cases.subjects.config, {
      Encryption: new EncryptionNoopAdapter(cases.subjects.encoded),
    });

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(result)).toEqual(true);

    const second = await adapter.load();

    expect(second).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(second)).toEqual(true);
  });

  test(cases.failureEmpty.name, () => {
    const adapter = new EnvironmentLoaderEncryptedAdapter(cases.subjects.path, cases.subjects.config, {
      Encryption: new EncryptionNoopAdapter(),
    });

    expect(async () => adapter.load()).toThrow(cases.failureEmpty.output);
  });

  test(cases.failureAsyncSchema.name, async () => {
    const adapter = new EnvironmentLoaderEncryptedAdapter(cases.subjects.path, cases.subjects.asyncConfig, {
      Encryption: new EncryptionNoopAdapter(cases.subjects.encoded),
    });

    expect(async () => adapter.load()).toThrow(cases.failureAsyncSchema.output);
  });
});
