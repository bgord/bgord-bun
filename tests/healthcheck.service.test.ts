import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { Healthcheck } from "../src/healthcheck.service";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { MemoryConsumption } from "../src/memory-consumption.service";
import * as prereqs from "../src/prerequisites.service";
import { Uptime } from "../src/uptime.service";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({});
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const deps = { Clock, JsonFileReader, Logger };

const buildInfo = {
  BUILD_DATE: Clock.nowMs(),
  BUILD_VERSION: tools.PackageVersion.fromString("1.0.0").toString(),
};
const memoryConsumption = tools.Size.fromBytes(12345678);
const uptime = { duration: tools.Duration.Seconds(5), formatted: "5 seconds ago" };

describe("Healthcheck service", () => {
  test("200", async () => {
    spyOn(BuildInfoRepository, "extract").mockResolvedValue(buildInfo);
    spyOn(MemoryConsumption, "get").mockReturnValue(memoryConsumption);
    spyOn(Uptime, "get").mockReturnValue(uptime);

    const app = new Hono().get("/health", ...Healthcheck.build([new mocks.PrerequisiteOk()], deps));

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(200);
    expect(data).toEqual({
      ok: prereqs.PrerequisiteStatusEnum.success,
      version: buildInfo.BUILD_VERSION,
      uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
      memory: { bytes: memoryConsumption.toBytes(), formatted: memoryConsumption.format(tools.Size.unit.MB) },
      details: [{ label: "ok", outcome: mocks.VerificationSuccess }],
      durationMs: expect.any(Number),
    });
  });

  test("424", async () => {
    spyOn(BuildInfoRepository, "extract").mockResolvedValue(buildInfo);
    spyOn(MemoryConsumption, "get").mockReturnValue(memoryConsumption);
    spyOn(Uptime, "get").mockReturnValue(uptime);

    const app = new Hono().get(
      "/health",
      ...Healthcheck.build([new mocks.PrerequisiteOk(), new mocks.PrerequisiteFail()], deps),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(424);
    expect(data).toEqual({
      ok: prereqs.PrerequisiteStatusEnum.failure,
      version: buildInfo.BUILD_VERSION,
      uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
      memory: { bytes: memoryConsumption.toBytes(), formatted: memoryConsumption.format(tools.Size.unit.MB) },
      details: [
        { label: "ok", outcome: mocks.VerificationSuccess },
        { label: "fail", outcome: mocks.VerificationFailure({ message: "boom" }) },
      ],
      durationMs: expect.any(Number),
    });
  });
});
