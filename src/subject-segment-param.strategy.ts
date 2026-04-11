import type { HasRequestParam } from "./request-context.port";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
  type SubjectSegmentType,
} from "./subject-segment-request.strategy";

export class SubjectSegmentParamStrategy implements SubjectSegmentRequestStrategy {
  constructor(private readonly param: string) {}

  create(context: HasRequestParam): SubjectSegmentType {
    return context.request.param(this.param) ?? SubjectSegmentRequestEmpty;
  }
}
