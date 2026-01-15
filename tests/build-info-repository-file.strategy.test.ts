import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryFileStrategy } from "../src/build-info-repository-file.strategy";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import * as mocks from "./mocks";

const version = "1.2.3";
const size = tools.Size.fromBytes(0);

describe("BuildInfoRepositoryFileStrategy", () => {
  test("happy path", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version,
      timestamp: mocks.TIME_ZERO.ms,
      sha: mocks.SHA.toString(),
      size: size.toBytes(),
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });
    const result = await repository.extract();

    expect(result.timestamp.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.version.equals(tools.PackageVersion.fromString(version))).toEqual(true);
    expect(result.sha.equals(mocks.SHA)).toEqual(true);
    // TODO
    expect(result.size.toBytes()).toEqual(tools.SizeBytes.parse(0));
  });

  test("failure - file read", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version,
      timestamp: mocks.TIME_ZERO.ms,
      sha: mocks.SHA.toString(),
      size: size.toBytes(),
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });
    const fileReaderJsonRead = spyOn(FileReaderJson, "read").mockRejectedValue(
      new Error(mocks.IntentionalError),
    );

    expect(async () => repository.extract()).toThrow(mocks.IntentionalError);
    expect(fileReaderJsonRead).toHaveBeenCalledWith("infra/build-info.json");
  });

  test("failure - invalid version", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version: "abc",
      timestamp: mocks.TIME_ZERO.ms,
      sha: mocks.SHA.toString(),
      size: size.toBytes(),
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });

    expect(async () => repository.extract()).toThrow("package.version.schema.bad.chars");
  });

  test("failure - invalid timestamp", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version,
      timestamp: "abc",
      sha: mocks.SHA.toString(),
      size: size.toBytes(),
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });

    expect(async () => repository.extract()).toThrow("timestamp.invalid");
  });

  test("failure - invalid sha", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version,
      timestamp: mocks.TIME_ZERO.ms,
      sha: "abc",
      size: size.toBytes(),
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });

    expect(async () => repository.extract()).toThrow("commit.sha.value.invalid.hex");
  });

  test("failure - invalid size", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({
      version,
      timestamp: mocks.TIME_ZERO.ms,
      sha: mocks.SHA.toString(),
      size: "abc",
    });
    const repository = new BuildInfoRepositoryFileStrategy({ FileReaderJson });

    expect(async () => repository.extract()).toThrow("size.bytes.invalid");
  });
});
