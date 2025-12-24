import type { Context } from "hono";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import type { SecurityRulePort } from "./security-rule.port";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class SecurityRuleViolationThresholdAdapter implements SecurityRulePort {
  constructor(
    private readonly rule: SecurityRulePort,
    private readonly config: { threshold: number; subject: CacheSubjectResolver },
    private readonly deps: Dependencies,
  ) {}

  // Best-effort increment, occasional lost increments are acceptable for concurrent requests.
  async isViolated(c: Context) {
    const subject = await this.config.subject.resolve(c);

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
    return `violation_threshold_${this.config.threshold}_${this.rule.name}`;
  }
}
