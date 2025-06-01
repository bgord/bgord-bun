import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";

import { BuildInfoRepository, BuildVersionSchema, BuildVersionSchemaType } from "./build-info-repository";
import { MemoryConsumption } from "./memory-consumption";
import {
  AbstractPrerequisite,
  BasePrerequisiteConfig,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
} from "./prerequisites";
import { Uptime, UptimeResultType } from "./uptime";

const handler = createFactory();

type HealthcheckResultType = {
  ok: PrerequisiteStatusEnum;
  version: BuildVersionSchemaType;
  details: {
    label: PrerequisiteLabelType;
    status: PrerequisiteStatusEnum;
  }[];
  uptime: UptimeResultType;
  memory: {
    bytes: tools.Size["bytes"];
    formatted: ReturnType<tools.Size["format"]>;
  };
} & tools.StopwatchResultType;

export class Healthcheck {
  static build = (prerequisites: AbstractPrerequisite<BasePrerequisiteConfig>[]) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new tools.Stopwatch();

      const build = await BuildInfoRepository.extract();

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of prerequisites) {
        const status = await prerequisite.verify();
        details.push({ label: prerequisite.label, status });
      }

      const ok = details.every((result) => result.status !== PrerequisiteStatusEnum.failure)
        ? PrerequisiteStatusEnum.success
        : PrerequisiteStatusEnum.failure;

      const code = ok === PrerequisiteStatusEnum.success ? 200 : 424;

      const result: HealthcheckResultType = {
        ok,
        details,
        version: build.BUILD_VERSION ?? BuildVersionSchema.parse("unknown"),
        uptime: Uptime.get(),
        memory: {
          bytes: MemoryConsumption.get().toBytes(),
          formatted: MemoryConsumption.get().format(tools.SizeUnit.MB),
        },
        ...stopwatch.stop(),
      };

      return c.json(result, code);
    });
}
