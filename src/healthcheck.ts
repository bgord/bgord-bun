import * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";

import { BuildInfoRepository, BuildVersionSchemaType } from "./build-info-repository";

const handler = createFactory();

type HealthcheckResultType = {
  ok: bg.PrerequisiteStatusEnum;
  version: BuildVersionSchemaType;
  details: {
    label: bg.PrerequisiteLabelType;
    status: bg.PrerequisiteStatusEnum;
  }[];
  uptime: bg.UptimeResultType;
  memory: {
    bytes: tools.Size["bytes"];
    formatted: ReturnType<tools.Size["format"]>;
  };
} & bg.StopwatchResultType;

export class Healthcheck {
  static build = (prerequisites: bg.AbstractPrerequisite<bg.BasePrerequisiteConfig>[]) =>
    handler.createHandlers(async (c) => {
      const stopwatch = new bg.Stopwatch();

      const build = await BuildInfoRepository.extract();

      const details: HealthcheckResultType["details"][number][] = [];

      for (const prerequisite of prerequisites) {
        const status = await prerequisite.verify();
        details.push({ label: prerequisite.label, status });
      }

      const ok = details.every((result) => result.status !== bg.PrerequisiteStatusEnum.failure)
        ? bg.PrerequisiteStatusEnum.success
        : bg.PrerequisiteStatusEnum.failure;

      const code = ok === bg.PrerequisiteStatusEnum.success ? 200 : 424;

      const result: HealthcheckResultType = {
        ok,
        details,
        version: build.BUILD_VERSION ?? bg.Schema.BuildVersion.parse("unknown"),
        uptime: bg.Uptime.get(),
        memory: {
          bytes: bg.MemoryConsumption.get().toBytes(),
          formatted: bg.MemoryConsumption.get().format(tools.SizeUnit.MB),
        },
        ...stopwatch.stop(),
      };

      return c.json(result, code);
    });
}
