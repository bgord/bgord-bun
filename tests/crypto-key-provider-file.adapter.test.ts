import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderFileAdapter } from "../src/crypto-key-provider-file.adapter";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";
import * as mocks from "./mocks";

const HEX = EncryptionKeyValue.parse("a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
const path = tools.FilePathAbsolute.fromString("/run/secret.key");

const FileInspection = new FileInspectionNoopAdapter({ exists: true });

describe("CryptoKeyProviderFileAdapter", () => {
  test("happy path", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(HEX);
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toEqual("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toEqual(false);
  });

  test("happy path - trimmed EOL", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(`${"0".repeat(64)}\n`);
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toEqual("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toEqual(false);
  });

  test("missing file", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(HEX);
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    expect(async () => adapter.get()).toThrow("crypto.key.provider.file.adapter.missing.file");
  });

  test("empty file", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter("");
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });

  test("invalid content", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter("invalid-hex-string");
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });

  test("read error", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(HEX);
    using _ = spyOn(FileReaderText, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new CryptoKeyProviderFileAdapter(path, { FileInspection, FileReaderText });

    expect(async () => adapter.get()).toThrow(mocks.IntentionalError);
  });
});
