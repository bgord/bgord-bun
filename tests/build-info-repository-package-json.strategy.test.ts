import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryPackageJsonStrategy } from "../src/build-info-repository-package-json.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import * as mocks from "./mocks";

const version = "1.2.3";
const size = tools.Size.fromBytes(0);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const FileReaderJson = new FileReaderJsonNoopAdapter({ version });
const deps = { Clock, FileReaderJson };

const repository = new BuildInfoRepositoryPackageJsonStrategy(deps);

describe("BuildInfoRepositoryPackageJsonStrategy", () => {
  test("happy path", async () => {
    const result = await repository.extract();

    expect(result.timestamp.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.version).toEqual(tools.PackageVersion.fromString(version));
    expect(result.sha.equals(mocks.SHA)).toEqual(true);
    expect(result.size.equals(size)).toEqual(true);
  });

  test("failure - package.json read", async () => {
    const fileReaderJsonRead = spyOn(FileReaderJson, "read").mockRejectedValue(
      new Error(mocks.IntentionalError),
    );

    const result = await repository.extract();

    expect(result.timestamp.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.version.equals(tools.PackageVersion.fromString("0.0.0"))).toEqual(true);
    expect(fileReaderJsonRead).toHaveBeenCalledWith("package.json");
    expect(result.sha.equals(mocks.SHA)).toEqual(true);
    expect(result.size.equals(size)).toEqual(true);
  });
});
