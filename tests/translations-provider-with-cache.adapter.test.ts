import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverReadThroughStrategy } from "../src/cache-resolver-read-through.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { TranslationsProviderNoopAdapter } from "../src/translations-provider-noop.adapter";
import { TranslationsProviderWithCacheAdapter } from "../src/translations-provider-with-cache.adapter";
import * as mocks from "./mocks";

const english = { hello: "Hello" };
// cspell:ignore Cześć
const polish = { hello: "Cześć" };
const inner = new TranslationsProviderNoopAdapter({ en: english, pl: polish });

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const id = "id";
const adapter = new TranslationsProviderWithCacheAdapter({ id, inner }, deps);

describe("TranslationsProviderWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    using innerGetTranslationsFor = spyOn(inner, "getTranslationsFor");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");

    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("translations_provider"),
        new SubjectSegmentFixedStrategy(id),
        new SubjectSegmentFixedStrategy(mocks.languages.supported.en),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.getTranslationsFor(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
    expect(innerGetTranslationsFor).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      1,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    expect(await adapter.getTranslationsFor(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
    expect(innerGetTranslationsFor).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      2,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    jest.advanceTimersByTime(ttl.add(tools.Duration.Minutes(1)).ms);

    expect(await adapter.getTranslationsFor(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
    expect(innerGetTranslationsFor).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      3,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    jest.useRealTimers();
  });

  test("caches every language separately", async () => {
    await CacheResolver.flush();
    using innerGetTranslationsFor = spyOn(inner, "getTranslationsFor");

    const englishResolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("translations_provider"),
        new SubjectSegmentFixedStrategy(id),
        new SubjectSegmentFixedStrategy(mocks.languages.supported.en),
      ],
      deps,
    );
    const polishResolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("translations_provider"),
        new SubjectSegmentFixedStrategy(id),
        new SubjectSegmentFixedStrategy(mocks.languages.supported.pl),
      ],
      deps,
    );

    const englishSubject = await englishResolver.resolve();
    const polishSubject = await polishResolver.resolve();

    expect(englishSubject.hex.get()).not.toEqual(polishSubject.hex.get());

    expect(await adapter.getTranslationsFor(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
    expect(await adapter.getTranslationsFor(mocks.languages.supported.pl)).toEqual({ hello: "Cześć" });
    expect(innerGetTranslationsFor).toHaveBeenCalledTimes(2);

    expect(await adapter.getTranslationsFor(mocks.languages.supported.pl)).toEqual({ hello: "Cześć" });
    expect(innerGetTranslationsFor).toHaveBeenCalledTimes(2);
  });
});
