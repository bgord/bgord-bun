import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type RateLimitShieldOptionsType = { ms: tools.TimestampType };

export const TooManyRequestsError = new HTTPException(429, {
  message: "app.too_many_requests",
});

export const rateLimitShield = (options: RateLimitShieldOptionsType) => {
  const rateLimiter = new tools.RateLimiter(options);

  return createMiddleware(async (_c, next) => {
    const currentTimestampMs = Date.now();
    const check = rateLimiter.verify(currentTimestampMs);

    if (!check.allowed) {
      throw TooManyRequestsError;
    }

    return next();
  });
};
