import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { RequestContext } from "./request-context.port";
import type { SecurityRuleStrategy } from "./security-rule.strategy";
import { SecurityRuleName, type SecurityRuleNameType } from "./security-rule-name.vo";
import { SubjectRequestResolver } from "./subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";
import type { SubjectSegmentRequestStrategy } from "./subject-segment-request.strategy";

type Dependencies = { CacheRepository: CacheRepositoryPort; HashContent: HashContentStrategy };
type Config = {
  threshold: tools.IntegerPositiveType;
  segments: ReadonlyArray<SubjectSegmentRequestStrategy>;
};

export class SecurityRuleViolationThresholdStrategy implements SecurityRuleStrategy {
  private readonly resolver: SubjectRequestResolver;

  constructor(
    private readonly rule: SecurityRuleStrategy,
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {
    this.resolver = new SubjectRequestResolver(
      [new SubjectSegmentFixedStrategy(this.name), ...this.config.segments],
      this.deps,
    );
  }

  // Best-effort increment, occasional lost increments are acceptable for concurrent requests.
  async isViolated(context: RequestContext): Promise<boolean> {
    const subject = await this.resolver.resolve(context);

    const violated = await this.rule.isViolated(context);

    if (!violated) return false;

    try {
      const cached = await this.deps.CacheRepository.get(subject.hex);
      const count = typeof cached === "number" ? cached : 0;
      const next = tools.Int.nonNegative(count + 1);

      await this.deps.CacheRepository.set(subject.hex, next);

      if (next >= this.config.threshold) return true;
      return false;
    } catch {
      return false;
    }
  }

  get name(): SecurityRuleNameType {
    return v.parse(SecurityRuleName, `violation_threshold_${this.config.threshold}_${this.rule.name}`);
  }
}
