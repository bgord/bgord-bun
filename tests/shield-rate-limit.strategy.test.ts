import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ShieldRateLimitStrategy } from "../src/shield-rate-limit.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const ttl = tools.Duration.Seconds(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const Clock = new ClockFixedAdapter(tools.Timestamp.fromNumber(1000));
const HashContent = new HashContentSha256Strategy();
const deps = { Clock, CacheResolver, HashContent };

const resolver = new SubjectRequestResolver(
  [
    new SubjectSegmentFixedStrategy("ping"),
    new SubjectSegmentPathStrategy(),
    new SubjectSegmentUserStrategy(),
  ],
  deps,
);

const strategy = new ShieldRateLimitStrategy({ resolver, window: ttl }, { Clock, CacheResolver });

describe("ShieldRateLimitStrategy", () => {
  test("anon - happy path - within rate limit", async () => {
    const context = new RequestContextBuilder().withPath("/ping").build();

    const result = await strategy.evaluate(context);

    expect(result).toEqual(true);

    await CacheResolver.flush();
  });

  test("anon - failure - TooManyRequestsError", async () => {
    const context = new RequestContextBuilder().withPath("/ping").build();

    expect(await strategy.evaluate(context)).toEqual(true);

    const failure = await strategy.evaluate(context);

    expect(failure).toEqual(false);

    await CacheResolver.flush();
  });

  test("anon - happy path - after rate limit", async () => {
    const context = new RequestContextBuilder().withPath("/ping").build();

    expect(await strategy.evaluate(context)).toEqual(true);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect(await strategy.evaluate(context)).toEqual(true);

    await CacheResolver.flush();
  });

  test("user - happy path - within rate limit", async () => {
    const context = new RequestContextBuilder().withPath("/ping").build();

    const result = await strategy.evaluate(context);

    expect(result).toEqual(true);

    await CacheResolver.flush();
  });

  test("user - failure - TooManyRequestsError", async () => {
    const strategy = new ShieldRateLimitStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const context = new RequestContextBuilder().withPath("/ping").withUserId("abc").build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(await strategy.evaluate(context)).toEqual(false);

    await CacheResolver.flush();
  });

  test("user - happy path - after rate limit", async () => {
    const strategy = new ShieldRateLimitStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const context = new RequestContextBuilder().withPath("/ping").withUserId("abc").build();

    expect(await strategy.evaluate(context)).toEqual(true);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect(await strategy.evaluate(context)).toEqual(true);

    await CacheResolver.flush();
  });

  test("user - does not impact other users", async () => {
    const strategy = new ShieldRateLimitStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const firstUserContext = new RequestContextBuilder().withPath("/ping").withUserId("abc").build();
    const secondUserContext = new RequestContextBuilder().withPath("/ping").withUserId("def").build();

    const firstUserFirstRequest = await strategy.evaluate(firstUserContext);

    expect(firstUserFirstRequest).toEqual(true);

    const secondUserFirstRequest = await strategy.evaluate(secondUserContext);

    expect(secondUserFirstRequest).toEqual(true);

    const secondUserSecondRequest = await strategy.evaluate(secondUserContext);

    expect(secondUserSecondRequest).toEqual(false);

    Clock.advanceBy(tools.Duration.Seconds(5));
    const firstUserSecondRequest = await strategy.evaluate(firstUserContext);

    expect(firstUserSecondRequest).toEqual(true);

    await CacheResolver.flush();
  });
});
