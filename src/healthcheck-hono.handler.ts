import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import {
  type HealthcheckConfig,
  type HealthcheckDependencies,
  HealthcheckHandler,
} from "./healthcheck.handler";

const factory = createFactory();

export class HealthcheckHonoHandler implements HandlerHonoPort {
  private readonly handler: HealthcheckHandler;

  constructor(config: HealthcheckConfig, deps: HealthcheckDependencies) {
    this.handler = new HealthcheckHandler(config, deps);
  }

  handle() {
    return factory.createHandlers(async () => {
      const { headers, ...healthcheck } = await this.handler.check();

      return Response.json(healthcheck, { status: healthcheck.code, headers });
    });
  }
}
