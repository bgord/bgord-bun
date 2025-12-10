import { createMiddleware } from "hono/factory";
import type { ShieldPort } from "./shield.port";

export class ShieldCaptchaNoopAdapter implements ShieldPort {
  verify = createMiddleware(async (_c, next) => next());
}
