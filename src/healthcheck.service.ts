import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";
import { MemoryConsumption } from "./memory-consumption.service";
import * as prereqs from "./prerequisites.service";
import { Uptime, type UptimeResultType } from "./uptime.service";

const handler = createFactory();

type HealthcheckResultType = {
  ok: prereqs.PrerequisiteStatusEnum;
  version: string;
  details: { label: prereqs.PrerequisiteLabelType; outcome: prereqs.VerifyOutcome }[];
  uptime: UptimeResultType;
  memory: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
  durationMs: tools.Duration["ms"];
};

type Dependencies = { Clock: ClockPort; JsonFileReader: JsonFileReaderPort; Logger: LoggerPort };

export class Healthcheck {
  static build = (prerequisites: prereqs.Prerequisite[], deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new tools.Stopwatch(deps.Clock.nowMs());

      const buildInfo = await BuildInfoRepository.extract(deps);

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of prerequisites) {
        details.push({ label: prerequisite.label, outcome: await prerequisite.verify() });
      }

      const ok = details.every((result) => result.outcome.status !== prereqs.PrerequisiteStatusEnum.failure)
        ? prereqs.PrerequisiteStatusEnum.success
        : prereqs.PrerequisiteStatusEnum.failure;

      const code = ok === prereqs.PrerequisiteStatusEnum.success ? 200 : 424;

      const result: HealthcheckResultType = {
        ok,
        details,
        version: buildInfo.BUILD_VERSION ?? "unknown",
        uptime: Uptime.get(deps.Clock),
        memory: {
          bytes: MemoryConsumption.get().toBytes(),
          formatted: MemoryConsumption.get().format(tools.Size.unit.MB),
        },
        durationMs: stopwatch.stop().ms,
      };

      return c.json(result, code);
    });
}
