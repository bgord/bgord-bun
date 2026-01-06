import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import * as mocks from "./mocks";

const version = "1.2.3";

describe("BuildInfoRepositoryNoopStrategy", () => {
  test("happy path", async () => {
    const repository = new BuildInfoRepositoryNoopStrategy(
      mocks.TIME_ZERO,
      tools.PackageVersion.fromString(version),
    );
    const result = await repository.extract();

    expect(result.BUILD_DATE.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.BUILD_VERSION).toEqual(tools.PackageVersion.fromString(version));
  });

  test("no version", async () => {
    const repository = new BuildInfoRepositoryNoopStrategy(mocks.TIME_ZERO);
    const result = await repository.extract();

    expect(result.BUILD_DATE.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.BUILD_VERSION).toEqual(undefined);
  });
});
