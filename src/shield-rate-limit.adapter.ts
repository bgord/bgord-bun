import * as tools from "@bgord/tools";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ClockPort } from "./clock.port";
import type { RateLimitStorePort } from "./rate-limit-store.port";
import type { ShieldPort } from "./shield.port";

type SubjectResolver = (c: Context) => string;
type RateLimitShieldOptionsType = { enabled: boolean; store: RateLimitStorePort; subject: SubjectResolver };

type Dependencies = { Clock: ClockPort };

export const AnonSubjectResolver: SubjectResolver = () => "anon";
export const UserSubjectResolver: SubjectResolver = (c) => c.get("user")?.id ?? "anon";

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

export class ShieldRateLimitAdapter implements ShieldPort {
  constructor(
    private readonly options: RateLimitShieldOptionsType,
    private readonly deps: Dependencies,
  ) {}

  verify = createMiddleware(async (c, next) => {
    if (!this.options.enabled) return next();

    const subject = this.options.subject(c);

    let limiter = await this.options.store.get(subject);

    if (!limiter) {
      limiter = new tools.RateLimiter(this.options.store.ttl);
      this.options.store.set(subject, limiter);
    }

    const check = limiter.verify(this.deps.Clock.now());

    if (!check.allowed) throw TooManyRequestsError;

    this.options.store.set(subject, limiter);

    return next();
  });
}
