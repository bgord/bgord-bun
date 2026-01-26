import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheSubjectRequestResolver } from "./cache-subject-request-resolver.vo";
import type { ClockPort } from "./clock.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import type { ShieldStrategy } from "./shield.strategy";

type ShieldRateLimitOptionsType = { resolver: CacheSubjectRequestResolver; window: tools.Duration };

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export const ShieldRateLimitError = new HTTPException(429, { message: "shield.rate.limit" });

export class ShieldRateLimitStrategy implements ShieldStrategy {
  constructor(
    private readonly options: ShieldRateLimitOptionsType,
    private readonly deps: Dependencies,
  ) {}

  verify = createMiddleware(async (c, next) => {
    const context = new RequestContextAdapterHono(c);
    const subject = await this.options.resolver.resolve(context);

    const limiter = await this.deps.CacheResolver.resolve(
      subject.hex,
      async () => new tools.RateLimiter(this.options.window),
    );

    const result = limiter.verify(this.deps.Clock.now());

    if (!result.allowed) throw ShieldRateLimitError;

    return next();
  });
}
