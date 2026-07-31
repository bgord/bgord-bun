import type { SubjectSegmentApplicationStrategy } from "./subject-segment-application.strategy";
import type { SubjectSegmentRequestStrategy, SubjectSegmentType } from "./subject-segment-request.strategy";

export class SubjectSegmentFixedStrategy
  implements SubjectSegmentRequestStrategy, SubjectSegmentApplicationStrategy
{
  readonly label = "fixed";

  constructor(private readonly value: string) {}

  create(): SubjectSegmentType {
    return this.value;
  }
}
