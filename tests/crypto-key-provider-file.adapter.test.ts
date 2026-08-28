import { describe, expect, spyOn, test } from "bun:test";
import { CryptoKeyProviderFileAdapter } from "../src/crypto-key-provider-file.adapter";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.cryptoKeyProvider();

const FileInspection = new FileInspectionNoopAdapter({ exists: true });

describe("CryptoKeyProviderFileAdapter", () => {
  test(cases.happyPath.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.happyPath.input);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect({
      type: result.type,
      algorithm: result.algorithm,
      usages: result.usages,
      extractable: result.extractable,
    }).toEqual(cases.happyPath.output);
  });

  test("happy path - trimmed EOL", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(`${"0".repeat(64)}\n`);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect({
      type: result.type,
      algorithm: result.algorithm,
      usages: result.usages,
      extractable: result.extractable,
    }).toEqual(cases.happyPath.output);
  });

  test("missing file", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.happyPath.input);
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow("crypto.key.provider.file.adapter.missing.file");
  });

  test("empty content", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter("");
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });

  test("invalid content", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter("invalid-hex-string");
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow("encryption.key.value.invalid.hex");
  });

  test("read error", async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.happyPath.input);
    using _ = spyOn(FileReaderText, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow(mocks.IntentionalError);
  });
});
