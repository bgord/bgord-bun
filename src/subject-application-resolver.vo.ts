import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { SubjectSegmentApplicationStrategy } from "./subject-segment-application.strategy";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export const SubjectApplicationResolverError = {
  NoSegments: "subject.application.no.segments",
  TooManySegments: "subject.application.too.many.segments",
};

export class SubjectApplicationResolver {
  constructor(
    private readonly segments: ReadonlyArray<SubjectSegmentApplicationStrategy>,
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(SubjectApplicationResolverError.NoSegments);
    if (this.segments.length > 10) throw new Error(SubjectApplicationResolverError.TooManySegments);
  }

  async resolve(): Promise<{ hex: Hash; raw: ReadonlyArray<SubjectSegmentType> }> {
    const segments = this.segments.map((segment) => segment.create());
    const subject = JSON.stringify(segments);

    const hex = await this.deps.HashContent.hash(subject);

    return { hex, raw: segments };
  }
}
