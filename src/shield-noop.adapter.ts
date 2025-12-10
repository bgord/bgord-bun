import { createMiddleware } from "hono/factory";
import type { ShieldPort } from "./shield.port";

export class ShieldNoopAdapter implements ShieldPort {
  verify = createMiddleware(async (_c, next) => next());
}
