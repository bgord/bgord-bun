import type { CacheResolverPort } from "./cache-resolver.port";
import { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "./cache-subject-segment-fixed";
import type { HashContentPort } from "./hash-content.port";
import type { PrerequisiteVerificationResult, PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

type Dependencies = { CacheResolver: CacheResolverPort; HashContent: HashContentPort };

export class PrerequisiteVerifierWithCacheAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { id: string; inner: PrerequisiteVerifierPort },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixed("prerequisite_verifier"),
        new CacheSubjectSegmentFixed(this.kind),
        new CacheSubjectSegmentFixed(this.config.id),
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
