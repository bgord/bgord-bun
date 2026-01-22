import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src//cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src//cache-subject-segment-fixed.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithCacheAdapter } from "../src/prerequisite-verifier-with-cache.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierWithCacheAdapter", () => {
  test("success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const config = { id: "example", inner: pass };
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256Strategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const resolver = new CacheSubjectApplicationResolver(
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

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256Strategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "example", inner: fail }, deps);

    jest.useFakeTimers();
    const failVerify = spyOn(fail, "verify");

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("preserves kind", () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256Strategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "dns", inner: pass }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
