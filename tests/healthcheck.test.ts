import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { BuildInfoRepository } from "../src/build-info-repository.service";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { Healthcheck } from "../src/healthcheck.service";
import { MemoryConsumption } from "../src/memory-consumption.service";
import {
  AbstractPrerequisite,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../src/prerequisites.service";
import { Uptime } from "../src/uptime.service";

const Clock = new ClockFixedAdapter(1234);
const deps = { Clock };

type TestPrerequisiteConfigType = { label: string; enabled?: boolean };

class FakeSuccessPrerequisite extends AbstractPrerequisite<TestPrerequisiteConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.custom;

  constructor(readonly config: TestPrerequisiteConfigType) {
    super(config);
  }

  async verify() {
    return PrerequisiteStatusEnum.success;
  }
}

class FakeFailurePrerequisite extends AbstractPrerequisite<TestPrerequisiteConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.custom;

  constructor(readonly config: TestPrerequisiteConfigType) {
    super(config);
  }

  async verify() {
    return PrerequisiteStatusEnum.failure;
  }
}

const buildInfo = {
  BUILD_DATE: Clock.nowMs(),
  BUILD_VERSION: tools.BuildVersion.parse("1.0.0"),
};
const memoryConsumption = new tools.Size({
  value: 12345678,
  unit: tools.SizeUnit.b,
});
const uptime = {
  seconds: tools.Timestamp.parse(5),
  formatted: "5 seconds ago",
};

describe("Healthcheck", () => {
  test("healthcheck returns 200 if all prerequisites pass", async () => {
    spyOn(BuildInfoRepository, "extract").mockResolvedValue(buildInfo);
    spyOn(MemoryConsumption, "get").mockReturnValue(memoryConsumption);
    spyOn(Uptime, "get").mockReturnValue(uptime);

    const app = new Hono();
    const handler = Healthcheck.build(
      [new FakeSuccessPrerequisite({ label: "successful-prerequisite" })],
      deps,
    );
    app.get("/health", ...handler);

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: PrerequisiteStatusEnum.success,
      version: buildInfo.BUILD_VERSION,
      uptime,
      memory: { bytes: memoryConsumption.toBytes(), formatted: memoryConsumption.format(tools.SizeUnit.MB) },
      details: [{ label: "successful-prerequisite", status: PrerequisiteStatusEnum.success }],
      durationMs: expect.any(Number),
    });
  });

  test("healthcheck returns 424 if any prerequisite fails", async () => {
    spyOn(BuildInfoRepository, "extract").mockResolvedValue(buildInfo);
    spyOn(MemoryConsumption, "get").mockReturnValue(memoryConsumption);
    spyOn(Uptime, "get").mockReturnValue(uptime);

    const app = new Hono();
    const handler = Healthcheck.build(
      [
        new FakeSuccessPrerequisite({ label: "success-prerequisite" }),
        new FakeFailurePrerequisite({ label: "failure-prerequisite" }),
      ],
      deps,
    );
    app.get("/health", ...handler);

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toBe(424);
    expect(data).toEqual({
      ok: PrerequisiteStatusEnum.failure,
      version: buildInfo.BUILD_VERSION,
      uptime,
      memory: { bytes: memoryConsumption.toBytes(), formatted: memoryConsumption.format(tools.SizeUnit.MB) },
      details: [
        { label: "success-prerequisite", status: PrerequisiteStatusEnum.success },
        { label: "failure-prerequisite", status: PrerequisiteStatusEnum.failure },
      ],
      durationMs: expect.any(Number),
    });
  });
});
