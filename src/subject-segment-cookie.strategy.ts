import type { HasRequestCookie } from "./request-context.port";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
} from "./subject-segment-request.strategy";

export class SubjectSegmentCookieStrategy implements SubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: HasRequestCookie): SubjectSegmentType {
    return context.request.cookie(this.name) ?? SubjectSegmentRequestEmpty;
  }
}
