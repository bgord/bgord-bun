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
    return factory.createHandlers(async () => {
      const result = await this.handler.check();

      return Response.json(result.details, { status: result.code, headers: result.headers });
    });
  }
}
