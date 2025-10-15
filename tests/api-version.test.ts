import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersion } from "../src/api-version.middleware";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { JsonFileReaderNoopAdapter } from "../src/file-reader-json-noop.adpater";

const Clock = new ClockSystemAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({});
const deps = { Clock, JsonFileReader };

const app = new Hono().use(ApiVersion.build(deps)).get("/ping", (c) => c.text("OK"));

describe("ApiVersion middleware", () => {
  test("sets API version in header with known build version", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE: tools.Timestamp.parse(123),
      BUILD_VERSION: tools.PackageVersion.fromString("1.0.0").toString(),
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual("1.0.0");
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
  });

  test("sets default API version in header with unknown build version", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE: tools.Timestamp.parse(123),
      BUILD_VERSION: "unknown",
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual(ApiVersion.DEFAULT_API_VERSION);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
  });
});
