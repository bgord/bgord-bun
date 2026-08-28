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

  test(cases.happyPathTrimmed.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.happyPathTrimmed.input);
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

  test(cases.missingFile.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.missingFile.input);
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow(cases.missingFile.output);
  });

  test(cases.emptyContent.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.emptyContent.input);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow(cases.emptyContent.output);
  });

  test(cases.invalidContent.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.invalidContent.input);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow(cases.invalidContent.output);
  });

  test(cases.readError.name, async () => {
    const FileReaderText = new FileReaderTextNoopAdapter(cases.readError.input);
    using _ = spyOn(FileReaderText, "read").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new CryptoKeyProviderFileAdapter(cases.subjects.path, {
      FileInspection,
      FileReaderText,
    });

    expect(async () => adapter.get()).toThrow(cases.readError.output);
  });
});
