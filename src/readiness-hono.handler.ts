import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import { type ReadinessConfig, ReadinessHandler } from "./readiness.handler";

const factory = createFactory();

export class ReadinessHonoHandler implements HandlerHonoPort {
  private readonly handler: ReadinessHandler;

  constructor(config: ReadinessConfig) {
    this.handler = new ReadinessHandler(config);
  }

  handle() {
    return factory.createHandlers(async (c) => {
      const result = await this.handler.check();

      return c.json(result.details, result.code, result.headers);
    });
  }
}
