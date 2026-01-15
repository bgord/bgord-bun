import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import * as mocks from "./mocks";

const version = "1.2.3";
const size = tools.Size.fromBytes(0);

describe("BuildInfoRepositoryNoopStrategy", () => {
  test("happy path", async () => {
    const repository = new BuildInfoRepositoryNoopStrategy(
      mocks.TIME_ZERO,
      tools.PackageVersion.fromString(version),
      mocks.SHA,
      size,
    );
    const result = await repository.extract();

    expect(result.timestamp.equals(mocks.TIME_ZERO)).toEqual(true);
    expect(result.version).toEqual(tools.PackageVersion.fromString(version));
    expect(result.sha.equals(mocks.SHA)).toEqual(true);
    expect(result.size.equals(size)).toEqual(true);
  });
});
