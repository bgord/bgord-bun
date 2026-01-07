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

    expect(result.timestamp.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.version).toEqual(tools.PackageVersion.fromString(version));
  });
});
