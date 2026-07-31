import type { HasRequestMethod } from "./request-context.port";
import type { SubjectSegmentRequestStrategy, SubjectSegmentType } from "./subject-segment-request.strategy";

export class SubjectSegmentMethodStrategy implements SubjectSegmentRequestStrategy {
  create(context: HasRequestMethod): SubjectSegmentType {
    return context.request.method;
  }
}
