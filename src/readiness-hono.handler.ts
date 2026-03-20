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
      const readiness = await this.handler.check();
      const code = readiness.ok ? 200 : 503;

      return c.json(readiness, code);
    });
  }
}
