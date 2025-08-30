import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";
import { MemoryConsumption } from "./memory-consumption.service";
import * as prereqs from "./prerequisites.service";
import { Uptime, type UptimeResultType } from "./uptime.service";

const handler = createFactory();

type HealthcheckResultType = {
  ok: prereqs.PrerequisiteStatusEnum;
  version: tools.BuildVersionType;
  details: { label: prereqs.PrerequisiteLabelType; status: prereqs.PrerequisiteStatusEnum }[];
  uptime: UptimeResultType;
  memory: { bytes: tools.Size["bytes"]; formatted: ReturnType<tools.Size["format"]> };
} & tools.StopwatchResultType;

type Dependencies = { Clock: ClockPort };

export class Healthcheck {
  static build = (
    prerequisites: prereqs.AbstractPrerequisite<prereqs.BasePrerequisiteConfig>[],
    deps: Dependencies,
  ) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new tools.Stopwatch(deps.Clock.nowMs());

      const build = await BuildInfoRepository.extract(deps);

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of prerequisites) {
        const status = await prerequisite.verify();
        details.push({ label: prerequisite.label, status });
      }

      const ok = details.every((result) => result.status !== prereqs.PrerequisiteStatusEnum.failure)
        ? prereqs.PrerequisiteStatusEnum.success
        : prereqs.PrerequisiteStatusEnum.failure;

      const code = ok === prereqs.PrerequisiteStatusEnum.success ? 200 : 424;

      const result: HealthcheckResultType = {
        ok,
        details,
        version: build.BUILD_VERSION ?? tools.BuildVersion.parse("unknown"),
        uptime: Uptime.get(deps.Clock),
        memory: {
          bytes: MemoryConsumption.get().toBytes(),
          formatted: MemoryConsumption.get().format(tools.SizeUnit.MB),
        },
        ...stopwatch.stop(),
      };

      return c.json(result, code);
    });
}
