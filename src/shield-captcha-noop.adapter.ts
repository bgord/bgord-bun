import { createMiddleware } from "hono/factory";
import type { ShieldCaptchaPort } from "./shield-captcha.port";

export class ShieldCaptchaNoop implements ShieldCaptchaPort {
  verify = createMiddleware(async (_c, next) => next());
}
