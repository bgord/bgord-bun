import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { PrerequisiteVerificationResult, PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };
type Config = { id: string; inner: PrerequisiteVerifierPort };

export class PrerequisiteVerifierWithCacheAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("prerequisite_verifier"),
        new SubjectSegmentFixedStrategy(this.kind),
        new SubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<PrerequisiteVerificationResult>(subject.hex, () =>
      this.config.inner.verify(),
    );
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
