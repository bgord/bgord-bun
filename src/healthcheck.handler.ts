import os from "node:os";
import * as tools from "@bgord/tools";
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

export enum HealthcheckStatusEnum {
  healthy = "healthy",
  degraded = "degraded",
  unhealthy = "unhealthy",
}

type Dependencies = {
  Clock: ClockPort;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
  LoggerStatsProvider?: LoggerStatsProviderPort;
};

export type HealthcheckConfig = {
  Env: NodeEnvironmentEnum;
  prerequisites: ReadonlyArray<Prerequisite>;
  redactor?: RedactorStrategy;
};

const self = new Prerequisite("self", new PrerequisiteVerifierSelfAdapter());

export const HealthcheckStatusCode = {
  [HealthcheckStatusEnum.healthy]: 200,
  [HealthcheckStatusEnum.degraded]: 207,
  [HealthcheckStatusEnum.unhealthy]: 424,
} as const;

export type HealthcheckResult = {
  status: HealthcheckStatusEnum;
  code: (typeof HealthcheckStatusCode)[keyof typeof HealthcheckStatusCode];
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
    uptime: Omit<UptimeResultType, "duration"> & { ms: tools.DurationMsType };
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
  details: ReadonlyArray<{
    label: PrerequisiteLabelType;
    outcome: PrerequisiteVerificationResult;
    ms: tools.DurationMsType;
  }>;
  logger?: LoggerStatsSnapshot;
  ms: tools.Duration["ms"];
  timestamp: tools.TimestampValueType;
};

export class HealthcheckHandler {
  constructor(
    private readonly config: HealthcheckConfig,
    private readonly deps: Dependencies,
  ) {}

  async check(): Promise<HealthcheckResult> {
    const stopwatch = new Stopwatch(this.deps);

    const prerequisites = [self, ...this.config.prerequisites]
      .filter((prerequisite) => prerequisite.enabled)
      .filter((prerequisite) => prerequisite.kind !== "port");

    const details = await Promise.all(
      prerequisites.map(async (prerequisite) => {
        const stopwatch = new Stopwatch(this.deps);

        const outcome = await prerequisite.build().verify();

        return {
          label: prerequisite.label,
          outcome: this.config.redactor ? this.config.redactor.redact(outcome) : outcome,
          ms: stopwatch.stop().ms,
        };
      }),
    );

    const hasFailure = details.some(
      (result) => result.outcome.outcome === PrerequisiteVerificationOutcome.failure,
    );
    const hasUndetermined = details.some(
      (result) => result.outcome.outcome === PrerequisiteVerificationOutcome.undetermined,
    );

    const status = hasFailure
      ? HealthcheckStatusEnum.unhealthy
      : hasUndetermined
        ? HealthcheckStatusEnum.degraded
        : HealthcheckStatusEnum.healthy;

    const build = await this.deps.BuildInfoRepository.extract();
    const uptime = Uptime.get(this.deps.Clock);
    const histogram = EventLoopLag.snapshot();
    const memory = MemoryConsumption.snapshot();

    return {
      status,
      code: HealthcheckStatusCode[status],
      details,
      deployment: {
        version: build.version.toString(),
        timestamp: build.timestamp.ms,
        date: new Date(build.timestamp.ms).toISOString(),
        sha: build.sha.toString(),
        size: build.size.format(tools.Size.unit.MB),
        environment: this.config.Env,
      },
      server: {
        pid: process.pid,
        hostname: os.hostname(),
        cpus: tools.Int.nonNegative(os.cpus().length),
        startup: this.deps.Clock.now().subtract(uptime.duration).ms,
        uptime: { ms: uptime.duration.ms, formatted: uptime.formatted },
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
      logger: this.deps.LoggerStatsProvider?.getStats(),
      ms: stopwatch.stop().ms,
      timestamp: this.deps.Clock.now().ms,
    };
  }
}
