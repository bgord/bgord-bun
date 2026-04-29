import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import * as v from "valibot";
import { HCaptchaSecretKey } from "./hcaptcha-secret-key.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { ShieldHcaptchaStrategy } from "./shield-hcaptcha.strategy";

export const ShieldHcaptchaLocalStrategyError = { Rejected: "shield.hcaptcha.local.rejected" };

export class ShieldHcaptchaLocalHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  private static readonly SECRET_KEY_LOCAL = v.parse(
    HCaptchaSecretKey,
    "0x0000000000000000000000000000000000000000",
  );

  private static readonly TOKEN_LOCAL = "10000000-aaaa-bbbb-cccc-000000000001";

  constructor() {
    this.strategy = new ShieldHcaptchaStrategy(ShieldHcaptchaLocalHonoStrategy.SECRET_KEY_LOCAL);
  }

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      if (await this.strategy.evaluate(ShieldHcaptchaLocalHonoStrategy.TOKEN_LOCAL)) return next();
      throw new HTTPException(403, { message: ShieldHcaptchaLocalStrategyError.Rejected });
    };
  }
}
