import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const Clock = new ClockSystemAdapter();
const deps = { Clock };

describe("BuildInfoRepository", () => {
  test("extract returns BUILD_DATE and BUILD_VERSION if package.json has version", async () => {
    const version = "1.2.3";

    spyOn(BuildInfoRepository, "getPackageJson").mockImplementation(async () => ({ version }));

    const result = await BuildInfoRepository.extract(deps);

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toBeDefined();
    expect(result.BUILD_VERSION).toEqual(tools.PackageVersion.fromString(version).toString());
  });

  test("extract returns only BUILD_DATE if package.json loading fails", async () => {
    spyOn(BuildInfoRepository, "getPackageJson").mockRejectedValue(new Error("File not found"));

    const result = await BuildInfoRepository.extract(deps);

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toEqual(undefined);
  });
});
