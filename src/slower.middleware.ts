import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export class Slower {
  static handle = (time: tools.TimeResult) =>
    createMiddleware(async (_c, next) => {
      await Bun.sleep(time.ms);
      return next();
    });
}
