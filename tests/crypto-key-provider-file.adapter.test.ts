import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderFileAdapter } from "../src/crypto-key-provider-file.adapter";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const HEX = EncryptionKeyValue.parse("a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
const path = tools.FilePathAbsolute.fromString("/run/secret.key");

const adapter = new CryptoKeyProviderFileAdapter(path);

describe("CryptoKeyProviderFileAdapter", () => {
  test("happy path", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => true, text: () => HEX }));

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toEqual("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toEqual(false);
  });

  test("happy path - trimmed EOL", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => true, text: () => `${"0".repeat(64)}\n` }));

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toEqual("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toEqual(false);
  });

  test("missing file", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => false }));

    expect(async () => adapter.get()).toThrow("crypto.key.provider.file.adapter.missing.file");
  });

  test("empty file", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => true, text: () => "" }));

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });

  test("invalid content", async () => {
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => true, text: () => "invalid-hex-string" }));

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });
});
