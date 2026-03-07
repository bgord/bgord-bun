import type { RequestHandler } from "express";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import type { HandlerExpressPort } from "./handler-express.port";
import { type HealthcheckConfig, HealthcheckHandler } from "./healthcheck.handler";
import type { LoggerStatsProviderPort } from "./logger-stats-provider.port";

type Dependencies = {
  Clock: ClockPort;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
  LoggerStatsProvider?: LoggerStatsProviderPort;
};

export class HealthcheckExpressHandler implements HandlerExpressPort {
  private readonly handler: HealthcheckHandler;

  constructor(config: HealthcheckConfig, deps: Dependencies) {
    this.handler = new HealthcheckHandler(config, deps);
  }

  handle(): RequestHandler {
    return async (_, response) => {
      const healthcheck = await this.handler.check();
      const code = healthcheck.ok ? 200 : 424;

      return response.status(code).json(healthcheck);
    };
  }
}
