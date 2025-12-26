import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteDecorator } from "../src/prerequisite-verifier.decorator";
import { RetryBackoffStrategyExponential } from "../src/retry-backoff-strategy-exponential";
import { RetryBackoffStrategyNoop } from "../src/retry-backoff-strategy-noop";
import { TimeoutError } from "../src/timeout.service";
import * as mocks from "./mocks";

describe("Prerequisite VO", () => {
  test("with logger - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    const loggerInfo = spyOn(Logger, "info");

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${pass.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("with logger - failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    const loggerError = spyOn(Logger, "error");

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      message: `Failure - ${fail.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
      error: mocks.IntentionalError,
    });
  });

  test("with logger - undetermined", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    const loggerInfo = spyOn(Logger, "info");
    spyOn(pass, "verify").mockResolvedValue(mocks.VerificationUndetermined);

    expect(await verifier.verify()).toEqual(mocks.VerificationUndetermined);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Undetermined - ${pass.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("with timeout - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5))],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("with timeout - failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5))],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("with timeout - timeout", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5))],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    spyOn(pass, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));

    // @ts-expect-error
    const result = (await verifier.verify()).error.message;

    expect(result).toEqual(TimeoutError.Exceeded);
  });

  test("with cache - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    jest.useFakeTimers();
    const passVerify = spyOn(pass, "verify");

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with cache - failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    jest.useFakeTimers();
    const failVerify = spyOn(fail, "verify");

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with everything", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const passVerify = spyOn(pass, "verify");
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withLogger(deps),
        PrerequisiteDecorator.withRetry({
          max: 3,
          backoff: new RetryBackoffStrategyExponential(tools.Duration.Ms(5)),
        }),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${pass.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    const passVerify = spyOn(pass, "verify");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
        PrerequisiteDecorator.withCache("example", deps),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - timeout not cached", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    // @ts-expect-error
    const passVerify = spyOn(pass, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
        PrerequisiteDecorator.withCache("example", deps),
      ],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual(TimeoutError.Exceeded);

    // @ts-expect-error
    const second = (await verifier.verify())?.error?.message;

    expect(second).toEqual(TimeoutError.Exceeded);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
  });

  test("cache x timeout - timeout cached", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    // @ts-expect-error
    const passVerify = spyOn(pass, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
      ],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual(TimeoutError.Exceeded);

    // @ts-expect-error
    const second = (await verifier.verify()).error.message;

    expect(second).toEqual(TimeoutError.Exceeded);
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x retry", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    const failVerify = spyOn(fail, "verify");
    const cacheRepositorySet = spyOn(CacheRepository, "set");
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withRetry({
          max: 3,
          backoff: new RetryBackoffStrategyNoop(),
        }),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(3);
    expect(cacheRepositorySet).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x logger - logs once", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const passVerify = spyOn(pass, "verify");
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withCache("example", deps), PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(loggerInfo).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("logger x cache - logs twice", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const passVerify = spyOn(pass, "verify");
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withLogger(deps), PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(loggerInfo).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
  });
});
