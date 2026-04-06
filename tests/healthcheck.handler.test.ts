import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { BuildInfo } from "../src/build-info.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventLoopLag, type EventLoopLagSnapshotType } from "../src/event-loop-lag.service";
import {
  EventLoopUtilization,
  type EventLoopUtilizationSnapshot,
} from "../src/event-loop-utilization.service";
import { HealthcheckHandler, HealthcheckStatusEnum } from "../src/healthcheck.handler";
import { JobQueueStatsProviderNoopAdapter } from "../src/job-queue-stats-provider-noop.adapter";
import { LoggerStatsProviderNoopAdapter } from "../src/logger-stats-provider-noop.adapter";
import { MemoryConsumption } from "../src/memory-consumption.service";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { RedactorComposite } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimit } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHide } from "../src/redactor-error-stack-hide.strategy";
import { Uptime } from "../src/uptime.service";
import * as mocks from "./mocks";

const hostname = "macbook";
const cpus: Array<os.CpuInfo> = [
  { model: "cpu", speed: 1, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
];
const memory = {
  total: tools.Size.fromMB(3),
  heap: { used: tools.Size.fromMB(1), total: tools.Size.fromMB(2) },
};
const uptime = { duration: tools.Duration.Seconds(5), formatted: "5 seconds ago" };
const histogram: EventLoopLagSnapshotType = {
  p50: tools.Duration.Ms(1),
  p95: tools.Duration.Ms(5),
  p99: tools.Duration.Ms(9),
};
const utilization: EventLoopUtilizationSnapshot = 0.5;

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoConfig = new ReactiveConfigNoopAdapter(BuildInfo, mocks.buildInfo);
const LoggerStatsProvider = new LoggerStatsProviderNoopAdapter();
const JobQueueStatsProvider = new JobQueueStatsProviderNoopAdapter();
const deps = { Clock, BuildInfoConfig };

describe("HealthcheckHandler", () => {
  test("200", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(cpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(hostname);
    using _memoryConsumption = spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    using _uptimeGet = spyOn(Uptime, "get").mockReturnValue(uptime);
    using _eventLoopLagSnapshot = spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    using _eventLoopUtilizationSnapshot = spyOn(EventLoopUtilization, "snapshot").mockReturnValue(
      utilization,
    );

    const handler = new HealthcheckHandler(
      {
        Env: NodeEnvironmentEnum.production,
        prerequisites: [
          mocks.PrerequisiteOk,
          new Prerequisite("disabled", new mocks.PrerequisiteVerifierPass(), { enabled: false }),
        ],
      },
      { ...deps, LoggerStatsProvider, JobQueueStatsProvider },
    );

    expect(await handler.check()).toEqual({
      status: HealthcheckStatusEnum.healthy,
      code: 200,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME,
        sha: mocks.SHA.value,
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: tools.Int.nonNegative(1),
        startup: expect.any(Number),
        uptime: { ms: uptime.duration.ms, formatted: uptime.formatted },
        memory: {
          total: { bytes: memory.total.toBytes(), formatted: "3 MB" },
          heap: {
            used: { bytes: memory.heap.used.toBytes(), formatted: "1 MB" },
            total: { bytes: memory.heap.total.toBytes(), formatted: "2 MB" },
          },
        },
        eventLoop: {
          lag: { p50: histogram.p50.ms, p95: histogram.p95.ms, p99: histogram.p99.ms },
          utilization,
        },
        inFlight: tools.Int.of(0),
      },
      details: [
        { label: "self", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        { label: "ok", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
      ],
      logger: LoggerStatsProvider.getStats(),
      queue: await JobQueueStatsProvider.getStats(),
      ms: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });

  test("200 - ignores port prerequisite", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(cpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(hostname);
    using _memoryConsumption = spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    using _uptimeGet = spyOn(Uptime, "get").mockReturnValue(uptime);
    using _eventLoopLagSnapshot = spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    using _eventLoopUtilizationSnapshot = spyOn(EventLoopUtilization, "snapshot").mockReturnValue(
      utilization,
    );

    const handler = new HealthcheckHandler(
      {
        Env: NodeEnvironmentEnum.production,
        prerequisites: [
          new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: v.parse(Port, 8000) })),
          mocks.PrerequisiteOk,
        ],
      },
      deps,
    );

    expect(await handler.check()).toEqual({
      status: HealthcheckStatusEnum.healthy,
      code: 200,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME,
        sha: mocks.SHA.value,
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: tools.Int.nonNegative(1),
        startup: expect.any(Number),
        uptime: { ms: uptime.duration.ms, formatted: uptime.formatted },
        memory: {
          total: { bytes: memory.total.toBytes(), formatted: "3 MB" },
          heap: {
            used: { bytes: memory.heap.used.toBytes(), formatted: "1 MB" },
            total: { bytes: memory.heap.total.toBytes(), formatted: "2 MB" },
          },
        },
        eventLoop: {
          lag: { p50: histogram.p50.ms, p95: histogram.p95.ms, p99: histogram.p99.ms },
          utilization,
        },
        inFlight: tools.Int.of(0),
      },
      details: [
        { label: "self", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        { label: "ok", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
      ],
      ms: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });

  test("207", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(cpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(hostname);
    using _memoryConsumption = spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    using _uptimeGet = spyOn(Uptime, "get").mockReturnValue(uptime);
    using _eventLoopLagSnapshot = spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    using _eventLoopUtilizationSnapshot = spyOn(EventLoopUtilization, "snapshot").mockReturnValue(
      utilization,
    );

    const handler = new HealthcheckHandler(
      {
        Env: NodeEnvironmentEnum.production,
        prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteUndetermined],
      },
      deps,
    );

    const result = await handler.check();

    expect(result.status).toEqual(HealthcheckStatusEnum.degraded);
    expect(result.code).toEqual(207);
  });

  test("424", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(cpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(hostname);
    using _memoryConsumption = spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    using _uptimeGet = spyOn(Uptime, "get").mockReturnValue(uptime);
    using _eventLoopLagSnapshot = spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    using _eventLoopUtilizationSnapshot = spyOn(EventLoopUtilization, "snapshot").mockReturnValue(
      utilization,
    );

    const handler = new HealthcheckHandler(
      {
        Env: NodeEnvironmentEnum.production,
        prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteFailWithStack],
        redactor: new RedactorComposite([
          new RedactorErrorStackHide(),
          new RedactorErrorCauseDepthLimit(tools.Int.nonNegative(1)),
        ]),
      },
      deps,
    );

    expect(await handler.check()).toEqual({
      status: HealthcheckStatusEnum.unhealthy,
      code: 424,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME,
        sha: mocks.SHA.value,
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: tools.Int.nonNegative(1),
        startup: expect.any(Number),
        uptime: { ms: uptime.duration.ms, formatted: uptime.formatted },
        memory: {
          total: { bytes: memory.total.toBytes(), formatted: "3 MB" },
          heap: {
            used: { bytes: memory.heap.used.toBytes(), formatted: "1 MB" },
            total: { bytes: memory.heap.total.toBytes(), formatted: "2 MB" },
          },
        },
        eventLoop: {
          lag: { p50: histogram.p50.ms, p95: histogram.p95.ms, p99: histogram.p99.ms },
          utilization,
        },
        inFlight: tools.Int.of(0),
      },
      details: [
        { label: "self", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        { label: "ok", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        {
          label: "fail-with-stack",
          outcome: {
            outcome: PrerequisiteVerificationOutcome.failure,
            error: { message: mocks.IntentionalError, name: "Error" },
          },
          ms: expect.any(Number),
        },
      ],
      ms: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });
});
