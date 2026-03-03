import { createFactory } from "hono/factory";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import type { HandlerHonoPort } from "./handler-hono.port";
import { type HealthcheckConfig, HealthcheckHandler } from "./healthcheck.handler";
import type { LoggerStatsProviderPort } from "./logger-stats-provider.port";

type Dependencies = {
  Clock: ClockPort;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
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
      const result = await this.handler.check();
      const code = result.ok ? 200 : 424;
      return c.json(result, code);
    });
  }
}
