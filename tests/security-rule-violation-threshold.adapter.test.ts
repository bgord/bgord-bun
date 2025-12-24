import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleViolationThresholdAdapter } from "../src/security-rule-violation-threshold.adapter";
import * as mocks from "./mocks";

const allowed = "/about";
const forbidden = "/.env";
const baitRoutes = new SecurityRuleBaitRoutesAdapter([forbidden]);

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
const HashContent = new HashContentSha256BunAdapter();
const deps = { CacheRepository, HashContent };
const config = { threshold: 3 };

const rule = new SecurityRuleViolationThresholdAdapter(baitRoutes, config, deps);

describe("SecurityRuleViolationThresholdAdapter", () => {
  test("isViolated - true", async () => {
    jest.useFakeTimers();
    const context = { env: mocks.ip, req: { path: forbidden, raw: {}, header: () => "anon" } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("isViolated - false", async () => {
    const context = { env: mocks.ip, req: { path: allowed, raw: {}, header: () => "anon" } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("isViolated - non-violations do not reset the counter", async () => {
    const context = { env: mocks.ip, req: { path: forbidden, raw: {}, header: () => "anon" } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(
      await rule.isViolated({ env: mocks.ip, req: { path: allowed, raw: {}, header: () => "anon" } } as any),
    ).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    await CacheRepository.flush();
  });

  test("isViolated - cache failure", async () => {
    spyOn(CacheRepository, "get").mockImplementation(mocks.throwIntentionalError);
    const context = { env: mocks.ip, req: { path: forbidden, raw: {}, header: () => "anon" } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("name", () => {
    expect(rule.name).toEqual("violation_threshold_3_bait_routes");
  });
});
