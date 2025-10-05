import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export class Slower {
  static handle = (offset: tools.Duration) =>
    createMiddleware(async (_c, next) => {
      await Bun.sleep(offset.ms);
      return next();
    });
}
