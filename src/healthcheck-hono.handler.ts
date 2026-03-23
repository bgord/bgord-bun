import { createFactory } from "hono/factory";
import type { BuildInfoType } from "./build-info.vo";
import type { ClockPort } from "./clock.port";
import type { HandlerHonoPort } from "./handler-hono.port";
import { type HealthcheckConfig, HealthcheckHandler } from "./healthcheck.handler";
import type { LoggerStatsProviderPort } from "./logger-stats-provider.port";
import type { ReactiveConfigPort } from "./reactive-config.port";

type Dependencies = {
  Clock: ClockPort;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
  LoggerStatsProvider?: LoggerStatsProviderPort;
};

const factory = createFactory();

export class HealthcheckHonoHandler implements HandlerHonoPort {
  private readonly handler: HealthcheckHandler;

  constructor(config: HealthcheckConfig, deps: Dependencies) {
    this.handler = new HealthcheckHandler(config, deps);
  }

  handle() {
    return factory.createHandlers(async (c) => {
      const healthcheck = await this.handler.check();

      return c.json(healthcheck, healthcheck.code);
    });
  }
}
