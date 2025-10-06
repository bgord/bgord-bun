import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersion } from "../src/api-version.middleware";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const Clock = new ClockSystemAdapter();
const deps = { Clock };

describe("ApiVersion middleware", () => {
  test("sets API version in header with known build version", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE: tools.Timestamp.parse(123),
      BUILD_VERSION: tools.PackageVersion.fromString("1.0.0").toString(),
    });

    const app = new Hono();
    app.use(ApiVersion.build(deps));
    app.get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    expect(result.status).toEqual(200);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual("1.0.0");
  });

  test("sets default API version in header with unknown build version", async () => {
    const buildInfoRepositoryExtract = spyOn(BuildInfoRepository, "extract").mockResolvedValue({
      BUILD_DATE: tools.Timestamp.parse(123),
      BUILD_VERSION: "unknown",
    });

    const app = new Hono();
    app.use(ApiVersion.build(deps));
    app.get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });
    expect(result.status).toEqual(200);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(result.headers.get(ApiVersion.HEADER_NAME)).toEqual(ApiVersion.DEFAULT_API_VERSION);
  });
});
