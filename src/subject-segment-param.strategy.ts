import type { HasRequestParam } from "./request-context.port";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
  type SubjectSegmentType,
} from "./subject-segment-request.strategy";

export class SubjectSegmentParamStrategy implements SubjectSegmentRequestStrategy {
  constructor(private readonly param: string) {}

  get label(): string {
    return `param:${this.param}`;
  }

  create(context: HasRequestParam): SubjectSegmentType {
    return context.request.param(this.param) ?? SubjectSegmentRequestEmpty;
  }
}
