import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteDecorator } from "../src/prerequisite-verifier.decorator";
import { PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import {} from "../src/timeout-runner.port";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import { TimeoutRunnerErrorAdapter } from "../src/timeout-runner-error.adapter";
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
    const undetermined = new mocks.PrerequisiteVerifierUndetermined();
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    const prerequisite = new Prerequisite("example", undetermined, {
      decorators: [PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    const loggerInfo = spyOn(Logger, "info");

    expect(await verifier.verify()).toEqual(mocks.VerificationUndetermined);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Undetermined - ${undetermined.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("with timeout - success", async () => {
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const deps = { TimeoutRunner };
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("with timeout - failure", async () => {
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const deps = { TimeoutRunner };
    const fail = new mocks.PrerequisiteVerifierFail();
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("with timeout - timeout", async () => {
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const deps = { TimeoutRunner };
    const pass = new mocks.PrerequisiteVerifierPass();

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps)],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    const result = (await verifier.verify()).error.message;

    expect(result).toEqual("timeout.exceeded");
  });

  test("with cache - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
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

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with cache - failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
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

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with everything", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const Sleeper = new SleeperNoopAdapter();
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver, Sleeper, TimeoutRunner };

    const passVerify = spyOn(pass, "verify");
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withLogger(deps),
        PrerequisiteDecorator.withRetry(
          {
            max: tools.IntegerPositive.parse(3),
            backoff: new RetryBackoffExponentialStrategy(tools.Duration.MIN),
          },
          deps,
        ),
        PrerequisiteDecorator.withFailSafe(
          (result) => result.outcome === PrerequisiteVerificationOutcome.failure,
        ),
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
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const deps = { HashContent, CacheResolver, TimeoutRunner };

    const passVerify = spyOn(pass, "verify");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
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
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const deps = { HashContent, CacheResolver, TimeoutRunner };

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
        PrerequisiteDecorator.withCache("example", deps),
      ],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual("timeout.exceeded");

    // @ts-expect-error
    const second = (await verifier.verify())?.error?.message;

    expect(second).toEqual("timeout.exceeded");

    await CacheRepository.flush();
  });

  test("cache x timeout - timeout cached", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const deps = { HashContent, CacheResolver, TimeoutRunner };

    const passVerify = spyOn(pass, "verify");
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
      ],
    });
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual("timeout.exceeded");

    // @ts-expect-error
    const second = (await verifier.verify()).error.message;

    expect(second).toEqual("timeout.exceeded");
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x retry", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();

    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const Sleeper = new SleeperNoopAdapter();
    const deps = { HashContent, CacheResolver, Sleeper };

    const failVerify = spyOn(fail, "verify");
    const cacheRepositorySet = spyOn(CacheRepository, "set");
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withRetry(
          { max: tools.IntegerPositive.parse(3), backoff: new RetryBackoffNoopStrategy() },
          deps,
        ),
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
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
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
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const HashContent = new HashContentSha256BunStrategy();
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
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

  test("timeout x fail-safe - timeout", async () => {
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const deps = { TimeoutRunner };

    const pass = new mocks.PrerequisiteVerifierPass();

    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withFailSafe(
          (result) =>
            result.outcome === PrerequisiteVerificationOutcome.failure &&
            result?.error?.message === "timeout.exceeded",
        ),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("retry x timeout x fail-safe - timeout", async () => {
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const Sleeper = new SleeperNoopAdapter();
    const deps = { TimeoutRunner, Sleeper };

    const fail = new mocks.PrerequisiteVerifierFail();

    const prerequisite = new Prerequisite("example", fail, {
      decorators: [
        PrerequisiteDecorator.withFailSafe(
          (result) =>
            result.outcome === PrerequisiteVerificationOutcome.failure &&
            result?.error?.message === "timeout.exceeded",
        ),
        PrerequisiteDecorator.withRetry(
          { max: tools.IntegerPositive.parse(3), backoff: new RetryBackoffNoopStrategy() },
          deps,
        ),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
      ],
    });
    const verifier = prerequisite.build();

    const failVerify = spyOn(fail, "verify");

    expect(await verifier.verify()).toEqual(mocks.VerificationUndetermined);
    expect(failVerify).toHaveBeenCalledTimes(3);
  });
});
