import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";
import { MemoryConsumption } from "./memory-consumption.service";
import { PrerequisiteSelf } from "./prerequisites/self";
import * as prereqs from "./prerequisites.service";
import { Uptime, type UptimeResultType } from "./uptime.service";

const handler = createFactory();

type HealthcheckResultType = {
  ok: prereqs.PrerequisiteVerificationOutcome;
  version: string;
  details: {
    label: prereqs.PrerequisiteLabelType;
    outcome: prereqs.PrerequisiteVerificationResult;
    durationMs: tools.DurationMsType;
  }[];
  uptime: Omit<UptimeResultType, "duration"> & { durationMs: tools.DurationMsType };
  memory: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
  durationMs: tools.Duration["ms"];
};

type Dependencies = { Clock: ClockPort; JsonFileReader: JsonFileReaderPort; Logger: LoggerPort };

export class Healthcheck {
  static build = (prerequisites: prereqs.Prerequisite[], deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new tools.Stopwatch(deps.Clock.now());

      const buildInfo = await BuildInfoRepository.extract(deps);

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of [new PrerequisiteSelf({ label: "self" }), ...prerequisites].filter(
        (prerequisite) => prerequisite.kind !== "port",
      )) {
        const stopwatch = new tools.Stopwatch(deps.Clock.now());

        const outcome = await prerequisite.verify(deps.Clock);

        const durationMs = stopwatch.stop().ms;

        details.push({ label: prerequisite.label, outcome, durationMs });
      }

      const ok = details.every(
        (result) => result.outcome.outcome !== prereqs.PrerequisiteVerificationOutcome.failure,
      )
        ? prereqs.PrerequisiteVerificationOutcome.success
        : prereqs.PrerequisiteVerificationOutcome.failure;

      const code = ok === prereqs.PrerequisiteVerificationOutcome.success ? 200 : 424;

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
