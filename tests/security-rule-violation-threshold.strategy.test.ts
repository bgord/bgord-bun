import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SecurityRuleBaitRoutesStrategy } from "../src/security-rule-bait-routes.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import { SecurityRuleViolationThresholdStrategy } from "../src/security-rule-violation-threshold.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const allowed = "/about";
const forbidden = "/.env";
const baitRoutes = new SecurityRuleBaitRoutesStrategy([forbidden]);

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const deps = { CacheRepository, HashContent };
const config = { threshold: tools.IntegerPositive.parse(3) };

const rule = new SecurityRuleViolationThresholdStrategy(baitRoutes, config, deps);

describe("SecurityRuleViolationThresholdStrategy", () => {
  test("isViolated - true", async () => {
    jest.useFakeTimers();
    const context = new RequestContextBuilder().withPath(forbidden).build();

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("isViolated - false", async () => {
    const context = new RequestContextBuilder().withPath(allowed).build();

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("isViolated - non-violations do not reset the counter", async () => {
    const context = new RequestContextBuilder().withPath(forbidden).build();

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(new RequestContextBuilder().withPath(allowed).build())).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(true);

    await CacheRepository.flush();
  });

  test("isViolated - cache failure", async () => {
    const context = new RequestContextBuilder().withPath(forbidden).build();
    using _ = spyOn(CacheRepository, "get").mockImplementation(mocks.throwIntentionalError);

    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);
    expect(await rule.isViolated(context)).toEqual(false);

    await CacheRepository.flush();
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("violation_threshold_3_bait_routes"));
  });
});
