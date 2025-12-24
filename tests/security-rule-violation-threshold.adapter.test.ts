import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { SecurityRuleBaitRoutesAdapter } from "../src/security-rule-bait-routes.adapter";
import { SecurityRuleViolationThresholdAdapter } from "../src/security-rule-violation-threshold.adapter";
import * as mocks from "./mocks";

const allowed = "/about";
const forbidden = "/.env";
const baitRoutes = new SecurityRuleBaitRoutesAdapter([forbidden]);

const HashContent = new HashContentSha256BunAdapter();
const subject = new CacheSubjectResolver(
  [new CacheSubjectSegmentFixed("security_rule_violation_threshold")],
  { HashContent },
);
const config = { threshold: 3, subject };

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
const deps = { CacheRepository };

const rule = new SecurityRuleViolationThresholdAdapter(baitRoutes, config, deps);

describe("SecurityRuleViolationThresholdAdapter", () => {
  test("isViolated - true", async () => {
    jest.useFakeTimers();
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("isViolated - false", async () => {
    const context = { req: { path: allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("isViolated - non-violations do not reset the counter", async () => {
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated({ req: { path: allowed } } as any)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    await CacheRepository.flush();
  });

  test("isViolated - cache failure", async () => {
    spyOn(CacheRepository, "get").mockImplementation(mocks.throwIntentionalError);
    const context = { req: { path: forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("name", () => {
    expect(rule.name).toEqual("violation_threshold_3_bait_routes");
  });
});
