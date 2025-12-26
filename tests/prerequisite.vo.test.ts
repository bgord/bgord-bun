import { describe, expect, jest, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteDecorator } from "../src/prerequisite-verifier.decorator";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import { TimeoutError } from "../src/timeout.service";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

const inner = new PrerequisiteVerifierDnsAdapter({ hostname });

describe("Prerequisite VO", () => {
  test("with logger - success", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    spyOn(dns, "lookup").mockResolvedValue(result);
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("dns", inner, [PrerequisiteDecorator.withLogger(deps)]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("with logger - failure", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);
    const loggerError = spyOn(Logger, "error");
    const prerequisite = new Prerequisite("dns", inner, [PrerequisiteDecorator.withLogger(deps)]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      message: `Failure - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
      error: mocks.IntentionalError,
    });
  });

  test("with logger - undetermined", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger };

    const loggerInfo = spyOn(Logger, "info");
    spyOn(inner, "verify").mockResolvedValue(mocks.VerificationUndetermined);
    const prerequisite = new Prerequisite("dns", inner, [PrerequisiteDecorator.withLogger(deps)]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationUndetermined);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Undetermined - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("with timeout - success", async () => {
    spyOn(dns, "lookup").mockResolvedValue(result);
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("with timeout - failure", async () => {
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("with timeout - timeout", async () => {
    // @ts-expect-error
    spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
    ]);
    const verifier = prerequisite.build();

    // @ts-expect-error
    const result = (await verifier.verify()).error.message;

    expect(result).toEqual(TimeoutError.Exceeded);
  });

  test("with cache - success", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    jest.useFakeTimers();
    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);
    const prerequisite = new Prerequisite("dns", inner, [PrerequisiteDecorator.withCache("dns", deps)]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with cache - failure", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    jest.useFakeTimers();
    const dnsLookup = spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);
    const prerequisite = new Prerequisite("dns", inner, [PrerequisiteDecorator.withCache("dns", deps)]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await verifier.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("with everything", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
      PrerequisiteDecorator.withCache("dns", deps),
      PrerequisiteDecorator.withLogger(deps),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - success", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
      PrerequisiteDecorator.withCache("dns", deps),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("timeout x cache - timeout not cached", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    // @ts-expect-error
    const dnsLookup = spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
      PrerequisiteDecorator.withCache("dns", deps),
    ]);
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual(TimeoutError.Exceeded);

    // @ts-expect-error
    const second = (await verifier.verify())?.error?.message;

    expect(second).toEqual(TimeoutError.Exceeded);
    expect(dnsLookup).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
  });

  test("cache x timeout - timeout cached", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const deps = { HashContent, CacheResolver };

    // @ts-expect-error
    const dnsLookup = spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(10).ms));
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withCache("dns", deps),
      PrerequisiteDecorator.withTimeout(tools.Duration.Ms(5)),
    ]);
    const verifier = prerequisite.build();

    // @ts-expect-error
    const first = (await verifier.verify()).error.message;

    expect(first).toEqual(TimeoutError.Exceeded);

    // @ts-expect-error
    const second = (await verifier.verify()).error.message;

    expect(second).toEqual(TimeoutError.Exceeded);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("cache x logger - logs once", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withCache("dns", deps),
      PrerequisiteDecorator.withLogger(deps),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);
    expect(loggerInfo).toHaveBeenCalledTimes(1);

    await CacheRepository.flush();
  });

  test("logger x cache - logs twice", async () => {
    const ttl = tools.Duration.Minutes(1);
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
    const HashContent = new HashContentSha256BunAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const Logger = new LoggerNoopAdapter();
    const deps = { Clock, Logger, HashContent, CacheResolver };

    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new Prerequisite("dns", inner, [
      PrerequisiteDecorator.withLogger(deps),
      PrerequisiteDecorator.withCache("dns", deps),
    ]);
    const verifier = prerequisite.build();

    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(await verifier.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);
    expect(loggerInfo).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
  });
});
