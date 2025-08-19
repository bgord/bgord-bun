import { createMiddleware } from "hono/factory";
import type { CaptchaShieldPort } from "./captcha-shield.port";

export class CaptchaShieldNoop implements CaptchaShieldPort {
  verify = createMiddleware(async (_c, next) => next());
}
