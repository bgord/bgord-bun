import { createMiddleware } from "hono/factory";
import type { ShieldCaptchaPort } from "./shield-captcha.port";

export class ShieldCaptchaNoopAdapter implements ShieldCaptchaPort {
  verify = createMiddleware(async (_c, next) => next());
}
