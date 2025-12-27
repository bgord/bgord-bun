import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { PrerequisiteVerifierWithCacheAdapter } from "../src/prerequisite-verifier-with-cache.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierWithCacheAdapter", () => {
  test("success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "example", inner: pass }, deps);

    jest.useFakeTimers();
    const passVerify = spyOn(pass, "verify");

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "example", inner: fail }, deps);

    jest.useFakeTimers();
    const failVerify = spyOn(fail, "verify");

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("preserves kind", () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { CacheResolver, HashContent };

    const prerequisite = new PrerequisiteVerifierWithCacheAdapter({ id: "dns", inner: pass }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
