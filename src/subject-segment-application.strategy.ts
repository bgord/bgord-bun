import type { SubjectSegmentType } from "./subject-segment-request.strategy";

export const SubjectSegmentApplicationEmpty: SubjectSegmentType = "__absent__";

export interface SubjectSegmentApplicationStrategy {
  create(): SubjectSegmentType;
}
