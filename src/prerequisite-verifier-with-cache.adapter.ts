import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { PrerequisiteVerificationResult, PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class PrerequisiteVerifierWithCacheAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { id: string; inner: PrerequisiteVerifierPort },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixedStrategy("prerequisite_verifier"),
        new CacheSubjectSegmentFixedStrategy(this.kind),
        new CacheSubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<PrerequisiteVerificationResult>(subject.hex, () =>
      this.config.inner.verify(),
    );
  }

  get kind() {
    return this.config.inner.kind;
  }
}
