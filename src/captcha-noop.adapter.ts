import { createMiddleware } from "hono/factory";
import { CaptchaPort } from "./captcha.port";

export class CaptchaNoopShield implements CaptchaPort {
  build = createMiddleware(async (_c, next) => next());
}
