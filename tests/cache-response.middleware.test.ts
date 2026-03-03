import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.strategy";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheResponseMiddleware } from "../src/cache-response.middleware";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver(
  [
    new SubjectSegmentFixedStrategy("ping"),
    new SubjectSegmentPathStrategy(),
    new SubjectSegmentUserStrategy(),
  ],
  deps,
);

const cacheResponse = new CacheResponseMiddleware({ enabled: true, resolver }, { CacheResolver });
const cacheResponseDisabled = new CacheResponseMiddleware({ enabled: false, resolver }, { CacheResolver });

describe("CacheResponseMiddleware", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(async () => {
    jest.useRealTimers();
    await CacheResolver.flush();
  });

  test("miss - uncached request", async () => {
    const context = new RequestContextBuilder().withPath("/ping-cached").build();

    const result = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(result?.source).toEqual(CacheSourceEnum.miss);
    expect(result?.response.body).toEqual(JSON.stringify({ message: "ping" }));
    expect(result?.response.status).toEqual(200);
  });

  test("hit - request is cached", async () => {
    const context = new RequestContextBuilder().withPath("/ping-cached").build();

    const first = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(first?.source).toEqual(CacheSourceEnum.miss);

    const second = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(second?.source).toEqual(CacheSourceEnum.hit);
    expect(second?.response.body).toEqual(JSON.stringify({ message: "ping" }));
  });

  test("miss - cache has expired", async () => {
    const context = new RequestContextBuilder().withPath("/ping-cached").build();

    const first = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(first?.source).toEqual(CacheSourceEnum.miss);

    const second = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(second?.source).toEqual(CacheSourceEnum.hit);

    jest.advanceTimersByTime(tools.Duration.Hours(2).ms);

    const third = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(third?.source).toEqual(CacheSourceEnum.miss);
  });

  test("miss - clearing the cache", async () => {
    const context = new RequestContextBuilder().withPath("/ping-cached").build();

    const first = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(first?.source).toEqual(CacheSourceEnum.miss);

    const second = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(second?.source).toEqual(CacheSourceEnum.hit);

    await cacheResponse.clear();

    const third = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(third?.source).toEqual(CacheSourceEnum.miss);
  });

  test("hit for one user, miss for another", async () => {
    const contextAdam = new RequestContextBuilder().withPath("/ping-cached").withUserId("Adam").build();
    const contextEve = new RequestContextBuilder().withPath("/ping-cached").withUserId("Eve").build();

    const firstAdam = await cacheResponse.evaluate(contextAdam, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(firstAdam?.source).toEqual(CacheSourceEnum.miss);

    const secondAdam = await cacheResponse.evaluate(contextAdam, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(secondAdam?.source).toEqual(CacheSourceEnum.hit);

    const firstEve = await cacheResponse.evaluate(contextEve, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(firstEve?.source).toEqual(CacheSourceEnum.miss);
  });

  test("disabled", async () => {
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const context = new RequestContextBuilder().withPath("/ping").build();

    const result = await cacheResponseDisabled.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(result).toEqual(null);
    expect(cacheResolverResolve).not.toHaveBeenCalled();
  });

  test("clear", async () => {
    const context = new RequestContextBuilder().withPath("/ping-cached").build();

    const first = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(first?.source).toEqual(CacheSourceEnum.miss);

    await cacheResponse.clear();

    const second = await cacheResponse.evaluate(context, async () => ({
      body: JSON.stringify({ message: "ping" }),
      headers: {},
      status: 200,
    }));

    expect(second?.source).toEqual(CacheSourceEnum.miss);
  });
});
