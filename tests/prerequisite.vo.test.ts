import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteDecorator } from "../src/prerequisite-verifier.decorator";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Sleeper = new SleeperNoopAdapter();
const TimeoutRunner = new TimeoutRunnerNoopAdapter();
const HashContent = new HashContentSha256Strategy();

describe("Prerequisite VO", () => {
  test("with logger - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withLogger({ Clock, Logger })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Success - ${pass.kind}`,
        operation: "prerequisite_verify",
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("with logger - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const fail = new mocks.PrerequisiteVerifierFail();
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withLogger({ Clock, Logger })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Failure - ${fail.kind}`,
        operation: "prerequisite_verify",
        error: { message: mocks.IntentionalError },
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("with logger - undetermined", async () => {
    const Logger = new LoggerCollectingAdapter();
    const undetermined = new mocks.PrerequisiteVerifierUndetermined();
    const prerequisite = new Prerequisite("example", undetermined, {
      decorators: [PrerequisiteDecorator.withLogger({ Clock, Logger })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.undetermined);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Undetermined - ${undetermined.kind}`,
        operation: "prerequisite_verify",
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("with timeout - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, { TimeoutRunner })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("with timeout - failure", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, { TimeoutRunner })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
  });

  test("with timeout - timeout", async () => {
    using _ = spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withTimeout(tools.Duration.MIN, { TimeoutRunner })],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toMatchObject(PrerequisiteVerification.failure(mocks.IntentionalError));
  });

  test("with cache - success", async () => {
    jest.useFakeTimers();
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with cache - failure", async () => {
    jest.useFakeTimers();
    const fail = new mocks.PrerequisiteVerifierFail();
    using failVerify = spyOn(fail, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver };
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with everything", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const Logger = new LoggerCollectingAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver, Sleeper, TimeoutRunner };
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

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Success - ${pass.kind}`,
        operation: "prerequisite_verify",
        metadata: expect.any(tools.Duration),
      },
    ]);
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - success", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver, TimeoutRunner };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
        PrerequisiteDecorator.withCache("example", deps),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - timeout not cached", async () => {
    using _ = spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);
    const pass = new mocks.PrerequisiteVerifierPass();
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver, TimeoutRunner };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
        PrerequisiteDecorator.withCache("example", deps),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toMatchObject(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(await verifier.verify()).toMatchObject(PrerequisiteVerification.failure(mocks.IntentionalError));

    await CacheRepository.flush();
  });

  test("cache x timeout - timeout cached", async () => {
    using _ = spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver, TimeoutRunner };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withCache("example", deps),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, deps),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toMatchObject(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(await verifier.verify()).toMatchObject(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(passVerify).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x retry", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();
    using failVerify = spyOn(fail, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const deps = { HashContent, CacheResolver, Sleeper };
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

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(3);
    expect(cacheRepositorySet).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x logger - logs once", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const Logger = new LoggerCollectingAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withCache("example", deps), PrerequisiteDecorator.withLogger(deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(Logger.entries.length).toEqual(1);

    await CacheRepository.flush();
  });

  test("logger x cache - logs twice", async () => {
    const pass = new mocks.PrerequisiteVerifierPass();
    using passVerify = spyOn(pass, "verify");
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const Logger = new LoggerCollectingAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [PrerequisiteDecorator.withLogger(deps), PrerequisiteDecorator.withCache("example", deps)],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(await verifier.verify()).toEqual(PrerequisiteVerification.success);
    expect(passVerify).toHaveBeenCalledTimes(1);
    expect(Logger.entries.length).toEqual(2);

    await CacheRepository.flush();
  });

  test("timeout x fail-safe - timeout", async () => {
    using _ = spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);
    const pass = new mocks.PrerequisiteVerifierPass();
    const prerequisite = new Prerequisite("example", pass, {
      decorators: [
        PrerequisiteDecorator.withFailSafe(
          (result) =>
            result.outcome === PrerequisiteVerificationOutcome.failure &&
            result?.error?.message === mocks.IntentionalError,
        ),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, { TimeoutRunner }),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.undetermined);
  });

  test("retry x timeout x fail-safe - timeout", async () => {
    using _ = spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);
    const fail = new mocks.PrerequisiteVerifierFail();
    using failVerify = spyOn(fail, "verify");
    const prerequisite = new Prerequisite("example", fail, {
      decorators: [
        PrerequisiteDecorator.withFailSafe(
          (result) =>
            result.outcome === PrerequisiteVerificationOutcome.failure &&
            result?.error?.message === mocks.IntentionalError,
        ),
        PrerequisiteDecorator.withRetry(
          { max: tools.IntegerPositive.parse(3), backoff: new RetryBackoffNoopStrategy() },
          { Sleeper },
        ),
        PrerequisiteDecorator.withTimeout(tools.Duration.MIN, { TimeoutRunner }),
      ],
    });
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(PrerequisiteVerification.undetermined);
    expect(failVerify).toHaveBeenCalledTimes(3);
  });
});
