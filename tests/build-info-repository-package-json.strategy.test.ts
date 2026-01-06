import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryPackageJsonStrategy } from "../src/build-info-repository-package-json.strategy";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import * as mocks from "./mocks";

const version = "1.2.3";

const Clock = new ClockSystemAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ version });
const deps = { Clock, FileReaderJson };

const repository = new BuildInfoRepositoryPackageJsonStrategy(deps);

describe("BuildInfoRepositoryPackageJsonStrategy", () => {
  test("happy path", async () => {
    const result = await repository.extract();

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toBeDefined();
    expect(result.BUILD_VERSION).toEqual(tools.PackageVersion.fromString(version));
  });

  test("failure - package.json read", async () => {
    const fileReaderJsonRead = spyOn(FileReaderJson, "read").mockRejectedValue(
      new Error(mocks.IntentionalError),
    );

    const result = await repository.extract();

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toEqual(undefined);
    expect(fileReaderJsonRead).toHaveBeenCalledWith("package.json");
  });
});
