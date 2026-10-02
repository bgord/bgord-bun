import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { BuildInfo } from "../src/build-info.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HealthcheckStatusEnum } from "../src/healthcheck.handler";
import { HealthcheckHonoHandler } from "../src/healthcheck-hono.handler";
import { JobQueueStatsProviderNoopAdapter } from "../src/job-queue-stats-provider-noop.adapter";
import { LoggerStatsProviderNoopAdapter } from "../src/logger-stats-provider-noop.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { RedactorComposite } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimit } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHide } from "../src/redactor-error-stack-hide.strategy";
import { RedactorNoop } from "../src/redactor-noop.strategy";
import { RuntimeStatsProviderNoopAdapter } from "../src/runtime-stats-provider-noop.adapter";
import * as mocks from "./mocks";

const redactor = new RedactorNoop();

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoConfig = new ReactiveConfigNoopAdapter(BuildInfo, mocks.buildInfo);
const LoggerStatsProvider = new LoggerStatsProviderNoopAdapter();
const JobQueueStatsProvider = new JobQueueStatsProviderNoopAdapter();
const RuntimeStatsProvider = new RuntimeStatsProviderNoopAdapter();
const deps = { Clock, BuildInfoConfig, RuntimeStatsProvider };

describe("HealthcheckHonoHandler", () => {
  test("200", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(mocks.osCpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(mocks.osHostname);

    const app = new Hono().get(
      "/health",
      ...new HealthcheckHonoHandler(
        {
          Env: NodeEnvironmentEnum.production,
          redactor,
          prerequisites: [
            mocks.PrerequisiteOk,
            new Prerequisite("disabled", new mocks.PrerequisiteVerifierPass(), { enabled: false }),
          ],
        },
        { ...deps, LoggerStatsProvider, JobQueueStatsProvider },
      ).handle(),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(200);
    expect(Object.fromEntries(response.headers.entries())).toEqual({
      "cache-control": "no-store",
      "content-type": "application/json;charset=utf-8",
    });
    expect(data).toEqual({
      status: HealthcheckStatusEnum.healthy,
      code: 200,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME_SHORT,
        sha: mocks.SHA.toString(),
        sizes: { server: "0 MB", web: { js: "0 kB", css: "0 kB" } },
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname: mocks.osHostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { ms: 0, formatted: "0 seconds ago" },
        memory: {
          total: { bytes: 0, formatted: "0 MB" },
          heap: {
            used: { bytes: 0, formatted: "0 MB" },
            total: { bytes: 0, formatted: "0 MB" },
          },
        },
        eventLoop: {
          lag: { p50: 0, p95: 0, p99: 0 },
          utilization: 0,
        },
        inFlight: 0,
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
    using _osCpus = spyOn(os, "cpus").mockReturnValue(mocks.osCpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(mocks.osHostname);

    const app = new Hono().get(
      "/health",
      ...new HealthcheckHonoHandler(
        {
          Env: NodeEnvironmentEnum.production,
          redactor,
          prerequisites: [
            new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: v.parse(Port, 8000) })),
            mocks.PrerequisiteOk,
          ],
        },
        deps,
      ).handle(),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(200);
    expect(data).toEqual({
      status: HealthcheckStatusEnum.healthy,
      code: 200,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME_SHORT,
        sha: mocks.SHA.toString(),
        sizes: { server: "0 MB", web: { js: "0 kB", css: "0 kB" } },
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname: mocks.osHostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { ms: 0, formatted: "0 seconds ago" },
        memory: {
          total: { bytes: 0, formatted: "0 MB" },
          heap: {
            used: { bytes: 0, formatted: "0 MB" },
            total: { bytes: 0, formatted: "0 MB" },
          },
        },
        eventLoop: {
          lag: { p50: 0, p95: 0, p99: 0 },
          utilization: 0,
        },
        inFlight: 0,
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
    using _osCpus = spyOn(os, "cpus").mockReturnValue(mocks.osCpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(mocks.osHostname);

    const app = new Hono().get(
      "/health",
      ...new HealthcheckHonoHandler(
        {
          Env: NodeEnvironmentEnum.production,
          redactor,
          prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteUndetermined],
        },
        deps,
      ).handle(),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(207);
    expect(data.status).toEqual(HealthcheckStatusEnum.degraded);
  });

  test("424", async () => {
    using _osCpus = spyOn(os, "cpus").mockReturnValue(mocks.osCpus);
    using _osHostname = spyOn(os, "hostname").mockReturnValue(mocks.osHostname);
    const app = new Hono().get(
      "/health",
      ...new HealthcheckHonoHandler(
        {
          Env: NodeEnvironmentEnum.production,
          prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteFailWithStack],
          redactor: new RedactorComposite([
            new RedactorErrorStackHide(),
            new RedactorErrorCauseDepthLimit(tools.Int.nonNegative(1)),
          ]),
        },
        deps,
      ).handle(),
    );

    const response = await app.request("/health");
    const data = await response.json();

    expect(response.status).toEqual(424);
    expect(data).toEqual({
      status: HealthcheckStatusEnum.unhealthy,
      code: 424,
      deployment: {
        version: mocks.version,
        timestamp: mocks.TIME_ZERO.ms,
        date: mocks.TIME_ZERO_PLAIN_DATE_TIME_SHORT,
        sha: mocks.SHA.toString(),
        sizes: { server: "0 MB", web: { js: "0 kB", css: "0 kB" } },
        environment: NodeEnvironmentEnum.production,
      },
      server: {
        pid: expect.any(Number),
        hostname: mocks.osHostname,
        cpus: 1,
        startup: expect.any(Number),
        uptime: { ms: 0, formatted: "0 seconds ago" },
        memory: {
          total: { bytes: 0, formatted: "0 MB" },
          heap: {
            used: { bytes: 0, formatted: "0 MB" },
            total: { bytes: 0, formatted: "0 MB" },
          },
        },
        eventLoop: {
          lag: { p50: 0, p95: 0, p99: 0 },
          utilization: 0,
        },
        inFlight: 0,
      },
      details: [
        { label: "self", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        { label: "ok", outcome: PrerequisiteVerification.success, ms: expect.any(Number) },
        {
          label: "fail-with-stack",
          outcome: { outcome: "failure", error: { message: mocks.IntentionalError, name: "Error" } },
          ms: expect.any(Number),
        },
      ],
      ms: expect.any(Number),
      timestamp: mocks.TIME_ZERO.ms,
    });
  });
});
