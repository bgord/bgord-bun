import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import {
  CryptoKeyProviderFileAdapter,
  CryptoKeyProviderFileAdapterError,
} from "../src/crypto-key-provider-file.adapter";
import { EncryptionKeyValue, EncryptionKeyValueError } from "../src/encryption-key-value.vo";

const path = tools.FilePathAbsolute.fromString("/run/secret.key");
const adapter = new CryptoKeyProviderFileAdapter(path);

const VALID_KEY = EncryptionKeyValue.parse(
  "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
);

describe("CryptoKeyProviderFileAdapter", () => {
  test("happy path", async () => {
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => true, text: () => VALID_KEY }) as any);

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toBe("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toBe(false);
  });

  test("missing file", async () => {
    spyOn(Bun, "file").mockImplementation(() => ({ exists: () => false }) as any);

    expect(async () => adapter.get()).toThrow(CryptoKeyProviderFileAdapterError.MissingFile);
  });

  test("invalid content", async () => {
    spyOn(Bun, "file").mockImplementation(
      () => ({ exists: () => true, text: () => "invalid-hex-string" }) as any,
    );

    expect(async () => adapter.get()).toThrow(EncryptionKeyValueError.InvalidHex);
  });
});
