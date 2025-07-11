import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";

import { BuildInfoRepository } from "../src/build-info-repository.service";

describe("BuildInfoRepository", () => {
  test("extract returns BUILD_DATE and BUILD_VERSION if package.json has version", async () => {
    const fakeVersion = "1.2.3";

    const buildInfoRepositoryGetPackageJson = spyOn(BuildInfoRepository, "getPackageJson").mockImplementation(
      async () => ({
        version: fakeVersion,
      }),
    );

    const result = await BuildInfoRepository.extract();

    expect(typeof result.BUILD_DATE).toBe("number");
    expect(result.BUILD_VERSION).toBeDefined();
    expect(result.BUILD_VERSION).toBe(tools.BuildVersion.parse(fakeVersion));

    buildInfoRepositoryGetPackageJson.mockRestore();
  });

  test("extract returns only BUILD_DATE if package.json loading fails", async () => {
    const buildInfoRepositoryGetPackageJson = spyOn(BuildInfoRepository, "getPackageJson").mockImplementation(
      async () => {
        throw new Error("File not found");
      },
    );

    const result = await BuildInfoRepository.extract();

    expect(typeof result.BUILD_DATE).toBe("number");
    expect(result.BUILD_VERSION).toBeUndefined();

    buildInfoRepositoryGetPackageJson.mockRestore();
  });
});
