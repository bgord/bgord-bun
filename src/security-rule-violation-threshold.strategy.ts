import * as tools from "@bgord/tools";
import type { Context } from "hono";
import type { CacheRepositoryPort } from "./cache-repository.port";
import { CacheSubjectRequestResolver } from "./cache-subject-request-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import { CacheSubjectSegmentIpStrategy } from "./cache-subject-segment-ip.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";

type Dependencies = { CacheRepository: CacheRepositoryPort; HashContent: HashContentStrategy };

export class SecurityRuleViolationThresholdStrategy implements SecurityRuleStrategy {
  constructor(
    private readonly rule: SecurityRuleStrategy,
    private readonly config: { threshold: tools.IntegerPositiveType },
    private readonly deps: Dependencies,
  ) {}

  // Best-effort increment, occasional lost increments are acceptable for concurrent requests.
  async isViolated(c: Context): Promise<boolean> {
    const resolver = new CacheSubjectRequestResolver(
      [new CacheSubjectSegmentFixedStrategy(this.name), new CacheSubjectSegmentIpStrategy()],
      this.deps,
    );
    const subject = await resolver.resolve(c);

    const violated = await this.rule.isViolated(c);

    if (!violated) return false;

    try {
      const count = (await this.deps.CacheRepository.get<tools.IntegerNonNegativeType>(subject.hex)) ?? 0;

      await this.deps.CacheRepository.set<tools.IntegerNonNegativeType>(
        subject.hex,
        tools.IntegerNonNegative.parse(count + 1),
      );

      if (count + 1 >= this.config.threshold) return true;
      return false;
    } catch {
      return false;
    }
  }

  get name(): SecurityRuleNameType {
    return SecurityRuleName.parse(`violation_threshold_${this.config.threshold}_${this.rule.name}`);
  }
}
