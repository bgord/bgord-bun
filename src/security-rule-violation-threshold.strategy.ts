import type * as tools from "@bgord/tools";
import type { Context } from "hono";
import type { CacheRepositoryPort } from "./cache-repository.port";
import { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import { CacheSubjectSegmentIpStrategy } from "./cache-subject-segment-ip.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName } from "./security-rule-name.vo";

type Dependencies = { CacheRepository: CacheRepositoryPort; HashContent: HashContentStrategy };

export class SecurityRuleViolationThresholdStrategy implements SecurityRuleStrategy {
  constructor(
    private readonly rule: SecurityRuleStrategy,
    private readonly config: { threshold: tools.IntegerPositiveType },
    private readonly deps: Dependencies,
  ) {}

  // Best-effort increment, occasional lost increments are acceptable for concurrent requests.
  async isViolated(c: Context) {
    const resolver = new CacheSubjectResolver(
      [new CacheSubjectSegmentFixedStrategy(this.name), new CacheSubjectSegmentIpStrategy()],
      this.deps,
    );
    const subject = await resolver.resolve(c);

    const violated = await this.rule.isViolated(c);

    if (!violated) return false;

    try {
      const count = (await this.deps.CacheRepository.get<number>(subject.hex)) ?? 0;

      await this.deps.CacheRepository.set<number>(subject.hex, count + 1);

      if (count + 1 >= this.config.threshold) return true;
      return false;
    } catch {
      return false;
    }
  }

  get name() {
    return SecurityRuleName.parse(`violation_threshold_${this.config.threshold}_${this.rule.name}`);
  }
}
