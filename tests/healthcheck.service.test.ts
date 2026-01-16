import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventLoopLag, type EventLoopLagSnapshotType } from "../src/event-loop-lag.service";
import {
  EventLoopUtilization,
  type EventLoopUtilizationSnapshot,
} from "../src/event-loop-utilization.service";
import { Healthcheck } from "../src/healthcheck.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { MemoryConsumption } from "../src/memory-consumption.service";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { Uptime } from "../src/uptime.service";
import * as mocks from "./mocks";

const version = "1.2.3";
const hostname = "macbook";
const cpus = ["abc"];
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

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoRepository = new BuildInfoRepositoryNoopStrategy(
  mocks.TIME_ZERO,
  tools.PackageVersion.fromString(version),
  mocks.SHA,
  tools.Size.fromBytes(0),
);
const deps = { Clock, Logger, BuildInfoRepository };

describe("Healthcheck service", () => {
  test("200", async () => {
    spyOn(os, "cpus").mockReturnValue(cpus as any);
    spyOn(os, "hostname").mockReturnValue(hostname);
    spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    spyOn(Uptime, "get").mockReturnValue(uptime);
    spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    spyOn(EventLoopUtilization, "snapshot").mockReturnValue(utilization);

    const app = new Hono().get(
      "/health",
      ...Healthcheck.build(
        NodeEnvironmentEnum.production,
        [
          mocks.PrerequisiteOk,
          new Prerequisite("disabled", new mocks.PrerequisiteVerifierPass(), { enabled: false }),
        ],
        deps,
      ),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(200);
    expect(data).toEqual({
      ok: true,
      deployment: {
        version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_ISO,
        sha: mocks.SHA.toString(),
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
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
        inFlight: 0,
      },
      details: [
        { label: "self", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
        { label: "ok", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
      ],
      durationMs: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });

  test("200 - ignores port prerequisite", async () => {
    spyOn(os, "cpus").mockReturnValue(cpus as any);
    spyOn(os, "hostname").mockReturnValue(hostname);
    spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    spyOn(Uptime, "get").mockReturnValue(uptime);
    spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    spyOn(EventLoopUtilization, "snapshot").mockReturnValue(utilization);
    const app = new Hono().get(
      "/health",
      ...Healthcheck.build(
        NodeEnvironmentEnum.production,
        [
          new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: Port.parse(8000) })),
          mocks.PrerequisiteOk,
        ],
        deps,
      ),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(200);
    expect(data).toEqual({
      ok: true,
      deployment: {
        version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_ISO,
        sha: mocks.SHA.toString(),
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
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
        inFlight: 0,
      },
      details: [
        { label: "self", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
        { label: "ok", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
      ],
      durationMs: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });

  test("424", async () => {
    spyOn(os, "cpus").mockReturnValue(cpus as any);
    spyOn(os, "hostname").mockReturnValue(hostname);
    spyOn(MemoryConsumption, "snapshot").mockReturnValue(memory);
    spyOn(Uptime, "get").mockReturnValue(uptime);
    spyOn(EventLoopLag, "snapshot").mockReturnValue(histogram);
    spyOn(EventLoopUtilization, "snapshot").mockReturnValue(utilization);
    const app = new Hono().get(
      "/health",
      ...Healthcheck.build(
        NodeEnvironmentEnum.production,
        [mocks.PrerequisiteOk, mocks.PrerequisiteFail],
        deps,
      ),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(424);
    expect(data).toEqual({
      ok: false,
      deployment: {
        version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_ISO,
        sha: mocks.SHA.toString(),
        size: "0 MB",
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
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
        inFlight: 0,
      },
      details: [
        { label: "self", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
        { label: "ok", outcome: mocks.VerificationSuccess, durationMs: expect.any(Number) },
        {
          label: "fail",
          outcome: mocks.VerificationFailure(mocks.IntentionalError),
          durationMs: expect.any(Number),
        },
      ],
      durationMs: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });
});
