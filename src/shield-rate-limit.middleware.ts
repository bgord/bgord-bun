import * as tools from "@bgord/tools";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ClockPort } from "./clock.port";
import type { RateLimitStorePort } from "./rate-limit-store.port";

type SubjectResolver = (c: Context) => string;
type RateLimitShieldOptionsType = { enabled: boolean; store: RateLimitStorePort; subject: SubjectResolver };
type Dependencies = { Clock: ClockPort };

export const AnonSubjectResolver: SubjectResolver = () => "anon";
export const UserSubjectResolver: SubjectResolver = (c) => c.get("user")?.id ?? "anon";

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

export const ShieldRateLimit = (options: RateLimitShieldOptionsType, deps: Dependencies) => {
  return createMiddleware(async (c, next) => {
    if (!options.enabled) return next();

    const subject = options.subject(c);

    let limiter = await options.store.get(subject);

    if (!limiter) {
      limiter = new tools.RateLimiter(options.store.ttl);
      options.store.set(subject, limiter);
    }

    const check = limiter.verify(deps.Clock.now());

    if (!check.allowed) throw TooManyRequestsError;

    options.store.set(subject, limiter);

    return next();
  });
};
