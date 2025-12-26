import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";
import { MemoryConsumption } from "./memory-consumption.service";
import { Prerequisite, type PrerequisiteLabelType } from "./prerequisite.vo";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "./prerequisite-verifier.port";
import { PrerequisiteVerifierSelfAdapter } from "./prerequisite-verifier-self.adapter";
import { Stopwatch } from "./stopwatch.service";
import { Uptime, type UptimeResultType } from "./uptime.service";

const handler = createFactory();

type HealthcheckResultType = {
  ok: PrerequisiteVerificationOutcome;
  version: string;
  details: {
    label: PrerequisiteLabelType;
    outcome: PrerequisiteVerificationResult;
    durationMs: tools.DurationMsType;
  }[];
  uptime: Omit<UptimeResultType, "duration"> & { durationMs: tools.DurationMsType };
  memory: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
  durationMs: tools.Duration["ms"];
};

type Dependencies = { Clock: ClockPort; JsonFileReader: JsonFileReaderPort; Logger: LoggerPort };

export class Healthcheck {
  static build = (prerequisites: Prerequisite[], deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new Stopwatch(deps.Clock.now());

      const buildInfo = await BuildInfoRepository.extract(deps);

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of [
        new Prerequisite("self", new PrerequisiteVerifierSelfAdapter()),
        ...prerequisites,
      ]
        .filter((prerequisite) => prerequisite.enabled)
        .filter((prerequisite) => prerequisite.kind !== "port")) {
        const stopwatch = new Stopwatch(deps.Clock.now());

        const outcome = await prerequisite.build().verify();

        const durationMs = stopwatch.stop().ms;

        details.push({ label: prerequisite.label, outcome, durationMs });
      }

      const ok = details.every((result) => result.outcome.outcome !== PrerequisiteVerificationOutcome.failure)
        ? PrerequisiteVerificationOutcome.success
        : PrerequisiteVerificationOutcome.failure;

      const code = ok === PrerequisiteVerificationOutcome.success ? 200 : 424;

      const uptime = Uptime.get(deps.Clock);

      const result: HealthcheckResultType = {
        ok,
        details,
        version: buildInfo.BUILD_VERSION ?? "unknown",
        uptime: { durationMs: uptime.duration.ms, formatted: uptime.formatted },
        memory: {
          bytes: MemoryConsumption.get().toBytes(),
          formatted: MemoryConsumption.get().format(tools.Size.unit.MB),
        },
        durationMs: stopwatch.stop().ms,
      };

      return c.json(result, code);
    });
}
