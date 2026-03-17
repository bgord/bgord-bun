import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";
import { SubjectRequestResolver } from "./subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";
import { SubjectSegmentIpStrategy } from "./subject-segment-ip.strategy";

type Dependencies = { CacheRepository: CacheRepositoryPort; HashContent: HashContentStrategy };
type Config = { threshold: tools.IntegerPositiveType };

export class SecurityRuleViolationThresholdStrategy implements SecurityRuleStrategy {
  constructor(
    private readonly rule: SecurityRuleStrategy,
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  // Best-effort increment, occasional lost increments are acceptable for concurrent requests.
  async isViolated(context: RequestContext): Promise<boolean> {
    const resolver = new SubjectRequestResolver(
      [new SubjectSegmentFixedStrategy(this.name), new SubjectSegmentIpStrategy()],
      this.deps,
    );
    const subject = await resolver.resolve(context);

    const violated = await this.rule.isViolated(context);

    if (!violated) return false;

    try {
      const count = (await this.deps.CacheRepository.get<tools.IntegerNonNegativeType>(subject.hex)) ?? 0;

      await this.deps.CacheRepository.set<tools.IntegerNonNegativeType>(
        subject.hex,
        tools.Int.nonNegative(count + 1),
      );

      if (count + 1 >= this.config.threshold) return true;
      return false;
    } catch {
      return false;
    }
  }

  get name(): SecurityRuleNameType {
    return v.parse(SecurityRuleName, `violation_threshold_${this.config.threshold}_${this.rule.name}`);
  }
}
