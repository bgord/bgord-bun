import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import * as mocks from "./mocks";

const version = "1.2.3";

const Clock = new ClockSystemAdapter();
const JsonFileReader = new FileReaderJsonNoopAdapter({ version });
const deps = { Clock, JsonFileReader };

describe("BuildInfoRepository service", () => {
  test("happy path", async () => {
    const result = await BuildInfoRepository.extract(deps);

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toBeDefined();
    expect(result.BUILD_VERSION).toEqual(tools.PackageVersion.fromString(version).toString());
  });

  test("failure - package.json read", async () => {
    spyOn(JsonFileReader, "read").mockRejectedValue(new Error(mocks.IntentionalError));

    const result = await BuildInfoRepository.extract(deps);

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toEqual(undefined);
  });
});
