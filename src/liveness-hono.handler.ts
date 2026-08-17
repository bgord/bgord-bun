import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import { LivenessHandler } from "./liveness.handler";

const factory = createFactory();

export class LivenessHonoHandler implements HandlerHonoPort {
  private readonly handler = new LivenessHandler();

  handle() {
    return factory.createHandlers(async () => {
      const { headers, ...body } = this.handler.execute();

      return Response.json(body, { status: 200, headers });
    });
  }
}
