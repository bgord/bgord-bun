import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import * as mocks from "./mocks";

const version = "1.2.3";

const repository = new BuildInfoRepositoryNoopStrategy(
  tools.PackageVersion.fromString(version),
  mocks.TIME_ZERO,
);

describe("BuildInfoRepositoryNoopStrategy", () => {
  test("happy path", async () => {
    const result = await repository.extract();

    expect(typeof result.BUILD_DATE).toEqual("number");
    expect(result.BUILD_VERSION).toBeDefined();
    expect(result.BUILD_VERSION).toEqual(tools.PackageVersion.fromString(version));
  });
});
