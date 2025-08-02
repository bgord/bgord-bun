import * as tools from "@bgord/tools";
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { RateLimitStore } from "./rate-limit-store.port";

type SubjectResolver = (c: Context) => string;

export const AnonSubjectResolver: SubjectResolver = () => "anon";

export const UserSubjectResolver: SubjectResolver = (c) => c.get("user")?.id ?? "anon";

type RateLimitShieldOptionsType = {
  enabled: boolean;
  store: RateLimitStore;
  subject: SubjectResolver;
};

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

export const RateLimitShield = (options: RateLimitShieldOptionsType) => {
  return createMiddleware(async (c, next) => {
    if (!options.enabled) return next();

    const subject = options.subject(c);

    let limiter = await options.store.get(subject);

    if (!limiter) {
      limiter = new tools.RateLimiter(options.store.time);
      options.store.set(subject, limiter);
    }

    const now = tools.Timestamp.parse(Date.now());
    const check = limiter.verify(now);

    if (!check.allowed) throw TooManyRequestsError;

    options.store.set(subject, limiter);

    return next();
  });
};
