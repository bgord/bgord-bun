import { createMiddleware } from "hono/factory";
import { CaptchaShieldPort } from "./captcha.port";

export class CaptchaNoopShield implements CaptchaShieldPort {
  build = createMiddleware(async (_c, next) => next());
}
