import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src//cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src//cache-subject-segment-fixed.strategy";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { PrerequisiteVerifierWithCacheAdapter } from "../src/prerequisite-verifier-with-cache.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierWithCacheAdapter", () => {
  test("success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const config = { id: "example", inner: pass };
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixedStrategy("prerequisite_verifier"),
        new CacheSubjectSegmentFixedStrategy(pass.kind),
        new CacheSubjectSegmentFixedStrategy(config.id),
      ],
      { HashContent },
    );
    const subject = await resolver.resolve();
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter(config, deps);

    jest.useFakeTimers();
    const passVerify = spyOn(pass, "verify");
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[0][0]).toEqual(subject.hex);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "example", inner: fail }, deps);

    jest.useFakeTimers();
    const failVerify = spyOn(fail, "verify");

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("preserves kind", () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "dns", inner: pass }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
