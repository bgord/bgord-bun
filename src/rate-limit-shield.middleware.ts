import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { RateLimitStore } from "./rate-limit-store.port";

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

type RateLimitShieldOptionsType = { time: tools.TimeResult; enabled: boolean; store: RateLimitStore };

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
