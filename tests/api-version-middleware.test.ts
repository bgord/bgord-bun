import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersion } from "../src/api-version.middleware";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";

const BUILD_DATE = tools.Timestamp.fromNumber(123).ms;

const Clock = new ClockSystemAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({});
const deps = { Clock, JsonFileReader };

const app = new Hono().use(ApiVersion.build(deps)).get("/ping", (c) => c.text("OK"));

describe("ApiVersion middleware", () => {
  test("happy path", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE,
      BUILD_VERSION: tools.PackageVersion.fromString("1.0.0").toString(),
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual("1.0.0");
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
  });

  test("unknown version", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE,
      BUILD_VERSION: "unknown",
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual(ApiVersion.DEFAULT_API_VERSION);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
  });
});
