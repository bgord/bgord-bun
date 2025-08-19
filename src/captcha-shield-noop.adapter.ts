import { createMiddleware } from "hono/factory";
import { CaptchaShieldPort } from "./captcha-shield.port";

export class CaptchaShieldNoop implements CaptchaShieldPort {
  build = createMiddleware(async (_c, next) => next());
}
