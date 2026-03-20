import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import { LivenessHandler } from "./liveness.handler";

const factory = createFactory();

export class LivenessHonoHandler implements HandlerHonoPort {
  private readonly handler = new LivenessHandler();

  handle() {
    return factory.createHandlers(async (c) => c.json(this.handler.execute(), 200));
  }
}
