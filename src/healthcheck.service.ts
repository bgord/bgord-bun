import os from "node:os";
import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import type { CommitShaValueType } from "./commit-sha-value.vo";
import { EventLoopLag } from "./event-loop-lag.service";
import { EventLoopUtilization, type EventLoopUtilizationSnapshot } from "./event-loop-utilization.service";
import { InFlightRequestsTracker } from "./in-flight-requests-tracker.service";
import type { LoggerStatsProviderPort, LoggerStatsSnapshot } from "./logger-stats-provider.port";
import { MemoryConsumption } from "./memory-consumption.service";
import type { NodeEnvironmentEnum } from "./node-env.vo";
import { Prerequisite, type PrerequisiteLabelType } from "./prerequisite.vo";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "./prerequisite-verifier.port";
import { PrerequisiteVerifierSelfAdapter } from "./prerequisite-verifier-self.adapter";
import type { RedactorStrategy } from "./redactor.strategy";
import { Stopwatch } from "./stopwatch.service";
import { Uptime, type UptimeResultType } from "./uptime.service";

const handler = createFactory();
const self = new Prerequisite("self", new PrerequisiteVerifierSelfAdapter());

type HealthcheckResultType = {
  ok: boolean;
  deployment: {
    version: string;
    timestamp: tools.TimestampValueType;
    date: string;
    sha: CommitShaValueType;
    size: string;
    environment: NodeEnvironmentEnum;
  };
  server: {
    pid: typeof process.pid;
    hostname: ReturnType<typeof os.hostname>;
    cpus: tools.IntegerNonNegativeType;
    startup: tools.TimestampValueType;
    uptime: Omit<UptimeResultType, "duration"> & { durationMs: tools.DurationMsType };
    memory: {
      total: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
      heap: {
        used: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
        total: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
      };
    };
    eventLoop: {
      lag: { p50: tools.DurationMsType; p95: tools.DurationMsType; p99: tools.DurationMsType };
      utilization: EventLoopUtilizationSnapshot;
    };
    inFlight: tools.IntegerType;
  };
  details: {
    label: PrerequisiteLabelType;
    outcome: PrerequisiteVerificationResult;
    durationMs: tools.DurationMsType;
  }[];
  logger?: LoggerStatsSnapshot;
  durationMs: tools.Duration["ms"];
  timestamp: tools.TimestampValueType;
};

type HealthcheckConfigType = {
  Env: NodeEnvironmentEnum;
  prerequisites: Prerequisite[];
  redactor?: RedactorStrategy;
};
type Dependencies = {
  Clock: ClockPort;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
  LoggerStatsProvider?: LoggerStatsProviderPort;
};

export class Healthcheck {
  static build = (config: HealthcheckConfigType, deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new Stopwatch(deps);

      const prerequisites = [self, ...config.prerequisites]
        .filter((prerequisite) => prerequisite.enabled)
        .filter((prerequisite) => prerequisite.kind !== "port");

      const details: HealthcheckResultType["details"][number][] = await Promise.all(
        prerequisites.map(async (prerequisite) => {
          const stopwatch = new Stopwatch(deps);

          const outcome = await prerequisite.build().verify();

          return {
            label: prerequisite.label,
            outcome: config.redactor ? config.redactor.redact(outcome) : outcome,
            durationMs: stopwatch.stop().ms,
          };
        }),
      );

      const ok = details.every(
        (result) => result.outcome.outcome !== PrerequisiteVerificationOutcome.failure,
      );

      const code = ok ? 200 : 424;

      const build = await deps.BuildInfoRepository.extract();
      const uptime = Uptime.get(deps.Clock);
      const histogram = EventLoopLag.snapshot();
      const memory = MemoryConsumption.snapshot();

      const response: HealthcheckResultType = {
        ok,
        details,
        deployment: {
          version: build.version.toString(),
          timestamp: build.timestamp.ms,
          date: new Date(build.timestamp.ms).toISOString(),
          sha: build.sha.toString(),
          size: build.size.format(tools.Size.unit.MB),
          environment: config.Env,
        },
        server: {
          pid: process.pid,
          hostname: os.hostname(),
          cpus: tools.IntegerNonNegative.parse(os.cpus().length),
          startup: deps.Clock.now().subtract(uptime.duration).ms,
          uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
          memory: {
            total: { bytes: memory.total.toBytes(), formatted: memory.total.format(tools.Size.unit.MB) },
            heap: {
              used: {
                bytes: memory.heap.used.toBytes(),
                formatted: memory.heap.used.format(tools.Size.unit.MB),
              },
              total: {
                bytes: memory.heap.total.toBytes(),
                formatted: memory.heap.total.format(tools.Size.unit.MB),
              },
            },
          },
          eventLoop: {
            lag: { p50: histogram.p50.ms, p95: histogram.p95.ms, p99: histogram.p99.ms },
            utilization: EventLoopUtilization.snapshot(),
          },
          inFlight: InFlightRequestsTracker.get(),
        },
        logger: deps.LoggerStatsProvider?.getStats(),
        durationMs: stopwatch.stop().ms,
        timestamp: deps.Clock.now().ms,
      };

      return c.json(response, code);
    });
}
