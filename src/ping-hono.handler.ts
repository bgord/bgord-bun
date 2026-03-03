import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import { PingHandler } from "./ping.handler";

const factory = createFactory();

export class PingHonoHandler implements HandlerHonoPort {
  private readonly handler = new PingHandler();

  handle() {
    return factory.createHandlers(async (c) => {
      const result = this.handler.execute();

      return c.text(result, 200);
    });
  }
}
