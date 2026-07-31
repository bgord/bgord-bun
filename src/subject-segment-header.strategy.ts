import type { HasRequestHeader } from "./request-context.port";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
} from "./subject-segment-request.strategy";

export class SubjectSegmentHeaderStrategy implements SubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  get label(): string {
    return `header:${this.name}`;
  }

  create(context: HasRequestHeader): SubjectSegmentType {
    return context.request.header(this.name) ?? SubjectSegmentRequestEmpty;
  }
}
