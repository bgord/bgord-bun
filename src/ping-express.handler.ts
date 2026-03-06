import type { RequestHandler } from "express";
import type { HandlerExpressPort } from "./handler-express.port";
import { PingHandler } from "./ping.handler";

export class PingExpressHandler implements HandlerExpressPort {
  private readonly handler = new PingHandler();

  handle(): RequestHandler {
    return (_, response) => {
      const result = this.handler.execute();

      response.status(200).send(result);
    };
  }
}
