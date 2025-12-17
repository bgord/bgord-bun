import * as tools from "@bgord/tools";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverPort } from "./cache-resolver.port";
import type { ClockPort } from "./clock.port";
import type { ShieldPort } from "./shield.port";

type SubjectResolver = (c: Context) => string;
type ShieldRateLimitOptionsType = { enabled: boolean; subject: SubjectResolver };

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverPort };

export const RateLimitSubjectAnon: SubjectResolver = (c) => `rate_limit_${c.req.url}_anon`;
export const RateLimitSubjectUser: SubjectResolver = (c) =>
  c.get("user")?.id ? `rate_limit_${c.req.url}_${c.get("user")?.id}` : RateLimitSubjectAnon(c);

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

export class ShieldRateLimitAdapter implements ShieldPort {
  constructor(
    private readonly options: ShieldRateLimitOptionsType,
    private readonly deps: Dependencies,
  ) {}

  verify = createMiddleware(async (c, next) => {
    if (!this.options.enabled) return next();

    const subject = this.options.subject(c);

    const limiter = await this.deps.CacheResolver.resolve(
      subject,
      async () => new tools.RateLimiter(this.deps.CacheResolver.ttl),
    );

    const result = limiter.verify(this.deps.Clock.now());

    if (!result.allowed) throw TooManyRequestsError;

    return next();
  });
}
