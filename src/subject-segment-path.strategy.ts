import type { HasRequestPath } from "./request-context.port";
import type { SubjectSegmentRequestStrategy, SubjectSegmentType } from "./subject-segment-request.strategy";

export class SubjectSegmentPathStrategy implements SubjectSegmentRequestStrategy {
  create(context: HasRequestPath): SubjectSegmentType {
    return context.request.path;
  }
}
