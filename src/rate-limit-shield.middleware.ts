import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type RateLimitShieldOptionsType = {
  time: tools.TimeResult;
  enabled: boolean;
};

export const TooManyRequestsError = new HTTPException(429, {
  message: "app.too_many_requests",
});

export const RateLimitShield = (options: RateLimitShieldOptionsType) => {
  const enabled = options.enabled;
  const rateLimiter = new tools.RateLimiter(options.time);

  return createMiddleware(async (_c, next) => {
    if (!enabled) return next();

    const currentTimestampMs = Date.now();
    const check = rateLimiter.verify(tools.Timestamp.parse(currentTimestampMs));

    if (!check.allowed) {
      throw TooManyRequestsError;
    }

    return next();
  });
};
