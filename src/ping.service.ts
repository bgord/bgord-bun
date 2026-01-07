import { createFactory } from "hono/factory";

const handler = createFactory();

export class Ping {
  static build = () => handler.createHandlers(async (c) => c.text("pong", 200));
}
