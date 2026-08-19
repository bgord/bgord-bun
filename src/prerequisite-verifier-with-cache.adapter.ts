import { CacheCodecIdentityStrategy } from "./cache-codec-identity.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { PrerequisiteVerificationResult, PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };
type Config = { id: string; inner: PrerequisiteVerifierPort };

export class PrerequisiteVerifierWithCacheAdapter implements PrerequisiteVerifierPort {
  private readonly codec = new CacheCodecIdentityStrategy<PrerequisiteVerificationResult>();
  private readonly resolver: SubjectApplicationResolver;

  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {
    this.resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("prerequisite_verifier"),
        new SubjectSegmentFixedStrategy(this.kind),
        new SubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );
  }

  async verify(): Promise<PrerequisiteVerificationResult> {
    const subject = await this.resolver.resolve();

    return this.deps.CacheResolver.resolve<PrerequisiteVerificationResult>(
      subject.hex,
      async () => this.config.inner.verify(),
      this.codec,
    );
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
