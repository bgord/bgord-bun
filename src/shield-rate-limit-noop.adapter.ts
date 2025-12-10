import { createMiddleware } from "hono/factory";
import type { ShieldPort } from "./shield.port";

export class ShieldRateLimitNoopAdapter implements ShieldPort {
  verify = createMiddleware(async (_c, next) => {
    return next();
  });
}
