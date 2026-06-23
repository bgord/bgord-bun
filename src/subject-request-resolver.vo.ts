import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { RequestContext } from "./request-context.port";
import type { SubjectSegmentRequestStrategy, SubjectSegmentType } from "./subject-segment-request.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export const SubjectRequestResolverError = {
  NoSegments: "subject.request.no.segments",
  TooManySegments: "subject.request.too.many.segments",
};

export class SubjectRequestResolver {
  constructor(
    private readonly segments: ReadonlyArray<SubjectSegmentRequestStrategy>,
    private readonly deps: Dependencies,
  ) {
    if (this.segments.length === 0) throw new Error(SubjectRequestResolverError.NoSegments);
    if (this.segments.length > 10) throw new Error(SubjectRequestResolverError.TooManySegments);
  }

  async resolve(context: RequestContext): Promise<{ hex: Hash; raw: ReadonlyArray<SubjectSegmentType> }> {
    const segments = this.segments.map((segment) => segment.create(context));
    const subject = JSON.stringify(segments);

    const hex = await this.deps.HashContent.hash(subject);

    return { hex, raw: segments };
  }
}
